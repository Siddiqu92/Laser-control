"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Tag } from "primereact/tag"; 
import { Dialog } from "primereact/dialog";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";
import { ApiService } from "../../../service/api";

interface Course {
    id: number;
    name: string;
    description: string | null;
    program_of_study: string | null;
    session: string | null;
    status: string;
    course_type: string;
}

const courseCache = new Map<number, Course>();
const preloadedCourses = new Set<number>();

export default function CoursesPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [globalFilter, setGlobalFilter] = useState<string>("");
    const [courses, setCourses] = useState<Course[]>([]);
    const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [first, setFirst] = useState<number>(0);
    const [rows, setRows] = useState<number>(25);
    const toast = useRef<Toast>(null);
    const [showDialog, setShowDialog] = useState<boolean>(false);
    const [formData, setFormData] = useState<Partial<Course>>({
        name: "",
        description: "",
        program_of_study: "",
        session: "",
        status: "draft",
        course_type: "base",
    });

    useEffect(() => {
        const pageParam = searchParams.get('page');
        const rowsParam = searchParams.get('rows');
        const searchParam = searchParams.get('search');
        if (pageParam) {
            const page = parseInt(pageParam);
            const rowsPerPage = rowsParam ? parseInt(rowsParam) : 25;
            setRows(rowsPerPage);
            setFirst((page - 1) * rowsPerPage);
        }
        if (searchParam) {
            setGlobalFilter(searchParam);
        }
    }, [searchParams]);

    useEffect(() => {
        const scrollY = sessionStorage.getItem('coursesScrollY');
        if (scrollY) {
            window.scrollTo(0, parseInt(scrollY));
            sessionStorage.removeItem('coursesScrollY');
        }
        const handleBeforeUnload = () => {
            sessionStorage.setItem('coursesScrollY', window.scrollY.toString());
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, []);

    const getCourses = useCallback(async () => {
        try {
            const coursesData = await ApiService.getCourses();
            setCourses(coursesData);
            setFilteredCourses(coursesData);
            preloadCourses(coursesData.slice(0, 10));
        } catch (error) {
            console.error("Failed to fetch courses:", error);
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to fetch courses',
                life: 3000
            });
        } finally {
            setLoading(false);
        }
    }, []);

    const preloadCourses = async (coursesToPreload: Course[]) => {
        coursesToPreload.forEach(async (course) => {
            if (!preloadedCourses.has(course.id)) {
                try {
                    const courseDetail = await ApiService.getCourseById(course.id);
                    courseCache.set(course.id, courseDetail);
                    preloadedCourses.add(course.id);
                } catch (error) {
                    console.warn(`Failed to preload course ${course.id}:`, error);
                }
            }
        });
    };

    const preloadCourseOnHover = async (courseId: number) => {
        if (!preloadedCourses.has(courseId)) {
            try {
                const courseDetail = await ApiService.getCourseById(courseId);
                courseCache.set(courseId, courseDetail);
                preloadedCourses.add(courseId);
            } catch (error) {
                console.warn(`Failed to preload course ${courseId} on hover:`, error);
            }
        }
    };

    useEffect(() => {
        getCourses();
    }, [getCourses]); 
    
    const updateURL = useCallback((search: string, page: number, rows: number) => {
        const params = new URLSearchParams();
        params.set('page', page.toString());
        params.set('rows', rows.toString());
        if (search.trim()) {
            params.set('search', search);
        }
        router.replace(`/courses?${params.toString()}`, { scroll: false });
    }, [router]);

    useEffect(() => {
        if (!globalFilter.trim()) {
            setFilteredCourses(courses);
        } else {
            const filtered = courses.filter(course =>
                course.name?.toLowerCase().includes(globalFilter.toLowerCase()) ||
                course.program_of_study?.toLowerCase().includes(globalFilter.toLowerCase()) ||
                course.session?.toLowerCase().includes(globalFilter.toLowerCase()) ||
                course.course_type?.toLowerCase().includes(globalFilter.toLowerCase()) ||
                course.status?.toLowerCase().includes(globalFilter.toLowerCase())
            );
            setFilteredCourses(filtered);
            preloadCourses(filtered.slice(0, 10));
        }
        const currentPage = Math.floor(first / rows) + 1;
        const timeoutId = setTimeout(() => {
            updateURL(globalFilter, currentPage, rows);
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [globalFilter, courses, first, rows, updateURL]);

    const onPageChange = (event: any) => {
        const newFirst = event.first;
        const newRows = event.rows;
        const currentPage = Math.floor(newFirst / newRows) + 1;
        setFirst(newFirst);
        setRows(newRows);
        const startIndex = newFirst;
        const endIndex = Math.min(startIndex + newRows, filteredCourses.length);
        preloadCourses(filteredCourses.slice(startIndex, endIndex));
        
        updateURL(globalFilter, currentPage, newRows);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setGlobalFilter(e.target.value);
        setFirst(0);
    };

    const handleClearSearch = () => {
        setGlobalFilter("");
        setFirst(0);
        const currentPage = Math.floor(first / rows) + 1;
        updateURL("", currentPage, rows);
    };

    const statusTemplate = (rowData: Course) => {
        const getSeverity = (status: string) => {
            switch (status) {
                case "execute":
                    return "success";
                case "draft":
                    return "warning";
                case "wip":
                    return "info";
                default:
                    return "warning";
            }
        };
        return (
            <Tag
                value={rowData.status}
                severity={getSeverity(rowData.status)}
            />
        );
    };

    const typeTemplate = (rowData: Course) => {
        return (
            <span className="capitalize">
                {rowData.course_type || "base"}
            </span>
        );
    };

    const programTemplate = (rowData: Course) => {
        return (
            <span>
                {rowData.program_of_study || "-"}
            </span>
        );
    };

    const sessionTemplate = (rowData: Course) => {
        return (
            <span>
                {rowData.session || "-"}
            </span>
        );
    };

    const handleRowClick = (e: any) => {
        const rowData: Course = e.data;
        const currentPage = Math.floor(first / rows) + 1;
        

        const cachedCourse = courseCache.get(rowData.id);
        if (cachedCourse) {
            sessionStorage.setItem(`course_${rowData.id}`, JSON.stringify(cachedCourse));
        }
        
        // Store basic course info
        sessionStorage.setItem('currentCourseBasic', JSON.stringify({
            id: rowData.id,
            name: rowData.name,
            program_of_study: rowData.program_of_study,
            session: rowData.session,
            status: rowData.status,
            course_type: rowData.course_type
        }));
        

        sessionStorage.setItem('coursesScrollY', window.scrollY.toString());
        sessionStorage.setItem('lastVisitedCourseId', rowData.id.toString());
        
  
        router.push(`/courses/courseviewer?courseId=${rowData.id}&fromPage=${currentPage}&rows=${rows}&search=${encodeURIComponent(globalFilter)}`);
    };


    const handleRowMouseEnter = (e: any) => {
        const rowData: Course = e.data;
        preloadCourseOnHover(rowData.id);
    };
    const nameTemplate = (rowData: Course) => {
        return (
            <span className="font-semibold">
                {rowData.name || "Unnamed Course"}
            </span>
        );
    };

    const handleChange = (field: keyof Course, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const saveCourse = async () => {
        try {
            if (!formData.name?.trim()) {
                toast.current?.show({
                    severity: 'warn',
                    summary: 'Warning',
                    detail: 'Course name is required',
                    life: 3000
                });
                return;
            }
            await ApiService.createCourse({
                ...formData,
                description: formData.description ?? undefined,
            });
            setShowDialog(false);
            setFormData({
                name: "",
                description: "",
                program_of_study: "",
                session: "",
                status: "draft",
                course_type: "base",
            });
            toast.current?.show({
                severity: 'success',
                summary: 'Success',
                detail: 'Course added successfully',
                life: 3000
            });           
            getCourses();
        } catch (error) {
            console.error("Failed to save course:", error);
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to save course',
                life: 3000
            });
        }
    };

    return (
        <div className="layout-main">
            <Toast ref={toast} />
            <div className="flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="text-900 font-bold text-3xl mb-1">Courses</h1>
                    <span className="text-600 text-sm">Manage and view all courses</span>
                </div>
               <Button
                    label="Add New Course"
                    icon="pi pi-plus"
                    className="p-button-primary"
                    onClick={() => setShowDialog(true)}
                    disabled
                />
            </div>
            <div className="surface-card p-4 border-round shadow-2">
                <div className="flex justify-content-between align-items-center mb-3">
                    <div className="text-900 font-semibold">
                        Total Courses: {filteredCourses.length}
                    </div>
                    <div className="flex gap-2">
                        <span className="p-input-icon-left w-full md:w-20rem">
                            <i className="pi pi-search" />
                            <InputText
                                value={globalFilter}
                                onChange={handleSearchChange}
                                placeholder="Search courses ..."
                                className="w-full"
                            />
                        </span>
                        {globalFilter && (
                            <Button
                                icon="pi pi-times"
                                className="p-button-text"
                                tooltip="Clear search"
                                onClick={handleClearSearch}
                            />
                        )}
                    </div>
                </div>
                {/* CLICKABLE ROWS FEATURE ADDED HERE */}
                <DataTable
                    value={filteredCourses}
                    paginator
                    rows={rows}
                    first={first}
                    loading={loading}
                    dataKey="id"
                    emptyMessage="No courses found."
                    className="p-datatable-sm compact-table clickable-rows"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} courses"
                    rowsPerPageOptions={[5, 10, 20, 25]}
                    onPage={onPageChange}
                    scrollable
                    scrollHeight="flex"
                    onRowClick={handleRowClick}
                    onRowMouseEnter={handleRowMouseEnter}
                    selectionMode="single"
                >
                    <Column 
                        header="Name" 
                        body={nameTemplate} 
                        sortable 
                        sortField="name"
                        style={{ minWidth: "180px", maxWidth: "200px" }} 
                        headerStyle={{ padding: "0.75rem" }}
                        bodyStyle={{ padding: "0.75rem" }}
                    />
                    <Column 
                        header="Program/Grade" 
                        body={programTemplate} 
                        style={{ minWidth: "120px", maxWidth: "140px" }} 
                        sortable
                        sortField="program_of_study"
                        headerStyle={{ padding: "0.75rem" }}
                        bodyStyle={{ padding: "0.75rem" }}
                    />
                    <Column 
                        header="Session" 
                        body={sessionTemplate} 
                        style={{ minWidth: "100px", maxWidth: "120px" }} 
                        sortable
                        sortField="session"
                        headerStyle={{ padding: "0.75rem" }}
                        bodyStyle={{ padding: "0.75rem" }}
                    />
                    <Column 
                        header="Type" 
                        body={typeTemplate} 
                        style={{ minWidth: "80px", maxWidth: "100px" }} 
                        sortable 
                        sortField="course_type"
                        headerStyle={{ padding: "0.75rem" }}
                        bodyStyle={{ padding: "0.75rem" }}
                    />
                    <Column 
                        header="Status" 
                        body={statusTemplate} 
                        style={{ minWidth: "90px", maxWidth: "110px" }} 
                        sortable 
                        sortField="status"
                        headerStyle={{ padding: "0.75rem" }}
                        bodyStyle={{ padding: "0.75rem" }}
                    />
                </DataTable>
            </div>
            <Dialog
                header="Add New Course"
                visible={showDialog}
                style={{ width: "500px" }}
                modal
                onHide={() => setShowDialog(false)}
            >
                <div className="flex flex-column gap-3">
                    <span className="p-float-label">
                        <InputText
                            value={formData.name || ""}
                            onChange={(e) => handleChange("name", e.target.value)}
                            className="w-full"
                        />
                        <label>Name *</label>
                    </span>
                    <span className="p-float-label">
                        <InputTextarea
                            value={formData.description || ""}
                            onChange={(e) => handleChange("description", e.target.value)}
                            rows={3}
                            className="w-full"
                        />
                        <label>Description (Optional)</label>
                    </span>
                    <span className="p-float-label">
                        <InputText
                            value={formData.program_of_study || ""}
                            onChange={(e) => handleChange("program_of_study", e.target.value)}
                            className="w-full"
                        />
                        <label>Program/Grade</label>
                    </span>
                    <span className="p-float-label">
                        <InputText
                            value={formData.session || ""}
                            onChange={(e) => handleChange("session", e.target.value)}
                            className="w-full"
                        />
                        <label>Session</label>
                    </span>
                    <span className="p-float-label">
                        <Dropdown
                            value={formData.course_type}
                            options={[
                                { label: "Base", value: "base" },
                                { label: "Advanced", value: "advanced" },
                                { label: "Special", value: "special" },
                            ]}
                            onChange={(e) => handleChange("course_type", e.value)}
                            className="w-full"
                        />
                        <label>Type</label>
                    </span>
                    <span className="p-float-label">
                        <Dropdown
                            value={formData.status}
                            options={[
                                { label: "Draft", value: "draft" },
                                { label: "Execute", value: "execute" },
                                { label: "Work in Progress", value: "wip" },
                            ]}
                            onChange={(e) => handleChange("status", e.value)}
                            className="w-full"
                        />
                        <label>Status</label>
                    </span>
                </div>
                <div className="flex justify-content-end gap-2 mt-4">
                    <Button
                        label="Cancel"
                        icon="pi pi-times"
                        className="p-button-text"
                        onClick={() => setShowDialog(false)}
                    />
                    <Button
                        label="Save"
                        icon="pi pi-check"
                        className="p-button-primary"
                        onClick={saveCourse}
                    />
                </div>
            </Dialog>
            <style jsx>{`
                .compact-table :global(.p-datatable-thead > tr > th),
                .compact-table :global(.p-datatable-tbody > tr > td) {
                    padding: 0.75rem !important;
                }
                .compact-table :global(.p-column-header-content) {
                    padding: 0.5rem;
                }
                
                /* CLICKABLE ROWS STYLING - NEW FEATURE ADDED */
                .clickable-rows :global(.p-datatable-tbody > tr) {
                    cursor: pointer !important;
                    transition: background-color 0.2s;
                }
                
                .clickable-rows :global(.p-datatable-tbody > tr:hover) {
                    background-color: #f8f9fa !important;
                }
                
                .clickable-rows :global(.p-datatable-tbody > tr:active) {
                    background-color: #e9ecef !important;
                }
                
                /* Remove any default link styling from name column */
                .clickable-rows :global(.p-datatable-tbody > tr .text-primary) {
                    color: inherit !important;
                    text-decoration: none !important;
                }
                
                .clickable-rows :global(.p-datatable-tbody > tr:hover .text-primary) {
                    color: inherit !important;
                }
            `}</style>
        </div>
    );
}