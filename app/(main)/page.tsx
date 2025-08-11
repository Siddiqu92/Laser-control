"use client";
import type { ChartDataState, ChartOptionsState } from "@/types";
import { ChartData, ChartOptions } from "chart.js";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { Chart } from "primereact/chart";
import { Column } from "primereact/column";
import { DataTable, DataTableFilterMeta } from "primereact/datatable";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Rating } from "primereact/rating";
import { Tooltip } from "primereact/tooltip";
import { Avatar } from "primereact/avatar"; // Added Avatar import
import React, { useContext, useEffect, useRef, useState } from "react";
import { LayoutContext } from "../../layout/context/layoutcontext";


interface Student {
    id: string;
    name: string;
    class: string;
    grade: string;
    attendance: string;
    status: string;
    performance: number;
    image: string;
}

export default function SchoolDashboard() {
    const [students, setStudents] = useState<Student[]>([]);
    const [chartOptions, setChartOptions] = useState<ChartOptionsState>({});
    const [timePeriods] = useState([
        {
            label: "Last Month",
            value: 0,
            data: [
                [75, 80, 85, 82, 78, 85, 90],
                [92, 88, 85, 89, 91, 87, 90],
            ],
        },
        {
            label: "This Month",
            value: 1,
            data: [
                [80, 82, 78, 85, 88, 90, 92],
                [88, 85, 90, 87, 89, 92, 95],
            ],
        },
    ]);
    const [chartData, setChartData] = useState<ChartDataState>({});
    const [selectedPeriod, setSelectedPeriod] = useState(0);
    const [filters, setFilters] = useState<DataTableFilterMeta>({});
    const [globalFilterValue, setGlobalFilterValue] = useState("");
    const { layoutConfig } = useContext(LayoutContext);
    const dt = useRef<DataTable<any>>(null);

    const exportCSV = () => {
        dt.current?.exportCSV();
    };

    const onPeriodChange = (e: DropdownChangeEvent) => {
        let newBarData = { ...chartData.barData };
        (newBarData.datasets as any)[0].data = timePeriods[e.value].data[0];
        (newBarData.datasets as any)[1].data = timePeriods[e.value].data[1];
        setSelectedPeriod(e.value);
        setChartData((prevState: ChartDataState) => ({
            ...prevState,
            barData: {
                ...prevState.barData,
                datasets: newBarData.datasets || [],
            },
        }));
    };

    const onGlobalFilterChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
        const value = e.target.value;
        let _filters = { ...filters };
        (_filters["global"] as any).value = value;

        setFilters(_filters);
        setGlobalFilterValue(value);
    };

    const initFilters = () => {
        setFilters({
            global: { value: null, matchMode: FilterMatchMode.CONTAINS },
            name: {
                operator: FilterOperator.AND,
                constraints: [
                    { value: null, matchMode: FilterMatchMode.STARTS_WITH },
                ],
            },
            class: {
                operator: FilterOperator.AND,
                constraints: [
                    { value: null, matchMode: FilterMatchMode.STARTS_WITH },
                ],
            },
            grade: {
                operator: FilterOperator.AND,
                constraints: [
                    { value: null, matchMode: FilterMatchMode.STARTS_WITH },
                ],
            },
            status: {
                operator: FilterOperator.OR,
                constraints: [
                    { value: null, matchMode: FilterMatchMode.EQUALS },
                ],
            },
        });
        setGlobalFilterValue("");
    };

    const nameBodyTemplate = (rowData: Student) => {
        return (
            <>
                <span className="p-column-title">Name</span>
                {rowData.name}
            </>
        );
    };

    const classBodyTemplate = (rowData: Student) => {
        return (
            <>
                <span className="p-column-title">Class</span>
                {rowData.class}
            </>
        );
    };

    const gradeBodyTemplate = (rowData: Student) => {
        return (
            <>
                <span className="p-column-title">Grade</span>
                {rowData.grade}
            </>
        );
    };
const statusBodyTemplate = (rowData: Student) => {
    const status = rowData.status?.toLowerCase();
    
    // Determine the appropriate CSS classes based on status
    let statusClasses = "";
    let statusText = rowData.status;
    
    switch(status) {
        case 'instock':
            statusClasses = "bg-green-100 text-green-800";
            break;
        case 'outofstock':
            statusClasses = "bg-red-100 text-red-800";
            break;
        case 'lowstock':
            statusClasses = "bg-orange-100 text-orange-800";
            break;
        default:
            statusClasses = "bg-blue-100 text-blue-800";
    }

    return (
        <>
            <span className="p-column-title">Status</span>
            <span 
                className={`${statusClasses} inline-flex items-center px-2 py-1 rounded-md text-xs font-medium`}
            >
                {statusText}
            </span>
        </>
    );
};

    const searchBodyTemplate = () => {
        return (
            <>
                <Button
                    type="button"
                    icon="pi pi-search"
                    outlined
                    rounded
                ></Button>
            </>
        );
    };

    useEffect(() => {
        // Mock data for students
        const mockStudents: Student[] = [
            { id: '1', name: 'John Smith', class: '10A', grade: 'A', attendance: '95%', status: 'Active', performance: 92, image: 'student1.jpg' },
            { id: '2', name: 'Emily Johnson', class: '11B', grade: 'A+', attendance: '98%', status: 'Active', performance: 95, image: 'student2.jpg' },
            { id: '3', name: 'Michael Brown', class: '9C', grade: 'B', attendance: '88%', status: 'Active', performance: 85, image: 'student3.jpg' },
            { id: '4', name: 'Sarah Davis', class: '12A', grade: 'A', attendance: '94%', status: 'Active', performance: 90, image: 'student4.jpg' },
            { id: '5', name: 'David Wilson', class: '8B', grade: 'B+', attendance: '90%', status: 'Active', performance: 87, image: 'student5.jpg' },
            { id: '6', name: 'Jessica Lee', class: '10B', grade: 'A-', attendance: '92%', status: 'Active', performance: 89, image: 'student6.jpg' },
        ];
        setStudents(mockStudents);

        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue("--text-color") || "#1e293b";
        const textColorSecondary = documentStyle.getPropertyValue("--text-color-secondary") || "#64748b";
        const surfaceBorder = documentStyle.getPropertyValue("--surface-border") || "#dfe7ef";

        const pieData: ChartData = {
            labels: ["Science", "Arts", "Commerce"],
            datasets: [
                {
                    data: [45, 25, 30],
                    backgroundColor: [
                        documentStyle.getPropertyValue("--primary-700") || "#4547a9",
                        documentStyle.getPropertyValue("--primary-400") || "#8183f4",
                        documentStyle.getPropertyValue("--primary-100") || "#dadafc",
                    ],
                    hoverBackgroundColor: [
                        documentStyle.getPropertyValue("--primary-600") || "#5457cd",
                        documentStyle.getPropertyValue("--primary-300") || "#9ea0f6",
                        documentStyle.getPropertyValue("--primary-200") || "#bcbdf9",
                    ],
                },
            ],
        };

        const pieOptions: ChartOptions = {
            animation: {
                duration: 0,
            },
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: textColor,
                        usePointStyle: true,
                        font: {
                            weight: "700",
                        },
                        padding: 28,
                    },
                    position: "bottom",
                },
            },
        };

        const barData: ChartData = {
            labels: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6", "Week 7"],
            datasets: [
                {
                    label: "Attendance Rate",
                    backgroundColor: documentStyle.getPropertyValue("--primary-500") || "#6366f1",
                    barThickness: 12,
                    borderRadius: 12,
                    data: timePeriods[selectedPeriod].data[0],
                },
                {
                    label: "Performance Score",
                    backgroundColor: documentStyle.getPropertyValue("--primary-200") || "#bcbdf9",
                    barThickness: 12,
                    borderRadius: 12,
                    data: timePeriods[selectedPeriod].data[1],
                },
            ],
        };

        const barOptions: ChartOptions = {
            animation: {
                duration: 0,
            },
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: textColor,
                        usePointStyle: true,
                        font: {
                            weight: "700",
                        },
                        padding: 28,
                    },
                    position: "bottom",
                },
            },
            scales: {
                x: {
                    ticks: {
                        color: textColorSecondary,
                        font: {
                            weight: "500",
                        },
                    },
                    grid: {
                        display: false,
                    },
                },
                y: {
                    min: 70,
                    max: 100,
                    ticks: {
                        color: textColorSecondary,
                        callback: function(value) {
                            return value + '%';
                        }
                    },
                    grid: {
                        color: surfaceBorder,
                    },
                },
            },
        };

        setChartOptions({
            barOptions,
            pieOptions,
        });
        setChartData({
            barData,
            pieData,
        });
        initFilters();
    }, [timePeriods, selectedPeriod, layoutConfig]);




    
    return (
        <div className="grid">
            {/* Stats Cards */}
            <div className="col-12 md:col-6 xl:col-3">
                <div className="card h-full">
                    <span className="font-semibold text-lg">Students</span>
                    <div className="flex justify-content-between align-items-start mt-3">
                        <div className="w-6">
                            <span className="text-4xl font-bold text-900">1,254</span>
                            <div className="text-green-500">
                                <span className="font-medium">+12%</span>
                                <i className="pi pi-arrow-up text-xs ml-2"></i>
                            </div>
                        </div>
                        <div className="w-6">
                            <svg
                                width="100%"
                                viewBox="0 0 258 96"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M1 93.9506L4.5641 94.3162C8.12821 94.6817 15.2564 95.4128 22.3846 89.6451C29.5128 83.8774 36.641 71.6109 43.7692 64.4063C50.8974 57.2018 58.0256 55.0592 65.1538 58.9268C72.2821 62.7945 79.4103 72.6725 86.5385 73.5441C93.6667 74.4157 100.795 66.2809 107.923 65.9287C115.051 65.5765 122.179 73.0068 129.308 66.8232C136.436 60.6396 143.564 40.8422 150.692 27.9257C157.821 15.0093 164.949 8.97393 172.077 6.43766C179.205 3.9014 186.333 4.86425 193.462 12.0629C200.59 19.2616 207.718 32.696 214.846 31.0487C221.974 29.4014 229.103 12.6723 236.231 5.64525C243.359 -1.38178 250.487 1.29325 254.051 2.63076L257.615 3.96827"
                                    style={{
                                        strokeWidth: "2px",
                                        stroke: "var(--primary-color)",
                                    }}
                                    stroke="10"
                                />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
            <div className="col-12 md:col-6 xl:col-3">
                <div className="card h-full">
                    <span className="font-semibold text-lg">Teachers</span>
                    <div className="flex justify-content-between align-items-start mt-3">
                        <div className="w-6">
                            <span className="text-4xl font-bold text-900">84</span>
                            <div className="text-green-500">
                                <span className="font-medium">+5%</span>
                                <i className="pi pi-arrow-up text-xs ml-2"></i>
                            </div>
                        </div>
                        <div className="w-6">
                            <svg
                                width="100%"
                                viewBox="0 0 115 41"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M1 35.6498L2.24444 32.4319C3.48889 29.214 5.97778 22.7782 8.46667 20.3627C10.9556 17.9473 13.4444 19.5522 15.9333 21.7663C18.4222 23.9803 20.9111 26.8035 23.4 30.6606C25.8889 34.5176 28.3778 39.4085 30.8667 37.2137C33.3556 35.0189 35.8444 25.7383 38.3333 26.3765C40.8222 27.0146 43.3111 37.5714 45.8 38.9013C48.2889 40.2311 50.7778 32.3341 53.2667 31.692C55.7556 31.0499 58.2444 37.6628 60.7333 39.4617C63.2222 41.2607 65.7111 38.2458 68.2 34.9205C70.6889 31.5953 73.1778 27.9597 75.6667 23.5955C78.1556 19.2313 80.6444 14.1385 83.1333 13.8875C85.6222 13.6365 88.1111 18.2272 90.6 20.2425C93.0889 22.2578 95.5778 21.6977 98.0667 18.8159C100.556 15.9341 103.044 10.7306 105.533 7.37432C108.022 4.01806 110.511 2.50903 111.756 1.75451L113 1"
                                    style={{
                                        strokeWidth: "1px",
                                        stroke: "var(--primary-color)",
                                    }}
                                />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
            <div className="col-12 md:col-6 xl:col-3">
                <div className="card h-full">
                    <span className="font-semibold text-lg">Classes</span>
                    <div className="flex justify-content-between align-items-start mt-3">
                        <div className="w-6">
                            <span className="text-4xl font-bold text-900">36</span>
                            <div className="text-green-500">
                                <span className="font-medium">+2</span>
                                <i className="pi pi-arrow-up text-xs ml-2"></i>
                            </div>
                        </div>
                        <div className="w-6">
                            <svg
                                width="100%"
                                viewBox="0 0 115 41"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M1.5 1L2.74444 2.61495C3.98889 4.2299 6.47778 7.4598 8.96667 9.07151C11.4556 10.6832 13.9444 10.6767 16.4333 11.6127C18.9222 12.5487 21.4111 14.4271 23.9 16.6724C26.3889 18.9178 28.8778 21.5301 31.3667 20.1977C33.8556 18.8652 36.3444 13.5878 38.8333 11.3638C41.3222 9.13969 43.8111 9.96891 46.3 11.9894C48.7889 14.0099 51.2778 17.2217 53.7667 16.2045C56.2556 15.1873 58.7444 9.9412 61.2333 11.2783C63.7222 12.6155 66.2111 20.5359 68.7 21.4684C71.1889 22.401 73.6778 16.3458 76.1667 16.0009C78.6556 15.6561 81.1444 21.0217 83.6333 24.2684C86.1222 27.515 88.6111 28.6428 91.1 27.4369C93.5889 26.2311 96.0778 22.6916 98.5667 22.7117C101.056 22.7317 103.544 26.3112 106.033 29.7859C108.522 33.2605 111.011 36.6302 112.256 38.3151L113.5 40"
                                    style={{
                                        strokeWidth: "1px",
                                        stroke: "var(--pink-500)",
                                    }}
                                />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
            <div className="col-12 md:col-6 xl:col-3">
                <div className="card h-full">
                    <span className="font-semibold text-lg">Attendance</span>
                    <div className="flex justify-content-between align-items-start mt-3">
                        <div className="w-6">
                            <span className="text-4xl font-bold text-900">94%</span>
                            <div className="text-green-500">
                                <span className="font-medium">+3%</span>
                                <i className="pi pi-arrow-up text-xs ml-2"></i>
                            </div>
                        </div>
                        <div className="w-6">
                            <svg
                                width="100%"
                                viewBox="0 0 103 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M0.5 22.7464L2 23C3.40972 23.1524 5.42201 18.0581 8.95833 16.9517C12 16 14.5972 23.4341 17.4167 20.4309C20.2361 17.4277 19 9.50002 25.5 9.50002C31 9.50002 30 4.00002 33 4.00002C35.8428 4.00002 40 13 42.7917 11.0655C47.3252 7.92391 48.4306 14.016 51.25 11.4384C54.0694 8.86075 56.5 12.5 59.7083 8.22399C63.3559 3.36252 65.4888 0.499985 68.5 0.499985C73 0.499985 73.5 7.00001 78.5 6.5C84.9677 5.85322 82.2931 2.58281 85 1.50002C87.5 0.500003 90.7222 11.8656 93.5417 8.93639C97.5 4.00002 99.1806 7.12226 100.59 7.6798L102 8.23734"
                                    stroke="#6366F1"
                                />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

<div className="col-12 xl:col-12">
    <div className="card h-auto">
        <div className="flex align-items-start justify-content-between mb-6">
            <span className="text-900 text-xl font-semibold">
                Subject Progress Dashboard
            </span>
        </div>
        
        {/* Filter Controls */}
        <div className="flex flex-wrap align-items-center gap-3 mb-4 p-3 border-round border-1 surface-border">
            <div className="flex flex-column" style={{ minWidth: '200px' }}>
                <label htmlFor="gradeSelect" className="text-sm font-medium mb-1">Grade</label>
                <Dropdown 
                    id="gradeSelect"
                    options={[
                        { label: 'All Grades', value: 'all' },
                        { label: 'Kindergarten', value: 'kindergarten' },
                        { label: 'Grade 1', value: 'grade1' },
                        { label: 'Grade 2', value: 'grade2' }
                    ]}
                    placeholder="Select Grade"
                    className="w-full"
                />
            </div>
            
            <div className="flex flex-column" style={{ minWidth: '200px' }}>
                <label htmlFor="subjectSelect" className="text-sm font-medium mb-1">Subject</label>
                <Dropdown 
                    id="subjectSelect"
                    options={[
                        { label: 'All Subjects', value: 'all' },
                        { label: 'Math', value: 'math' },
                        { label: 'Science', value: 'science' },
                        { label: 'English', value: 'english' }
                    ]}
                    placeholder="Select Subject"
                    className="w-full"
                />
            </div>
            

            
          <div className="flex flex-column" style={{ minWidth: '200px' }}>
    <label className="text-sm font-medium mb-1">Status</label>
    <div className="flex align-items-center gap-3">
        <div className="flex align-items-center">
            <Checkbox inputId="read" checked={true} onChange={() => {}} />
            <label htmlFor="read" className="ml-2 text-sm">Read</label>
        </div>
        <div className="flex align-items-center">
            <Checkbox inputId="unread" checked={false} onChange={() => {}} />
            <label htmlFor="unread" className="ml-2 text-sm">Unread</label>
        </div>
        <div className="flex align-items-center">
            <Checkbox inputId="failed" checked={false} onChange={() => {}} />
            <label htmlFor="failed" className="ml-2 text-sm">Failed</label>
        </div>
    </div>
</div>
            
            <Button 
                label="Load" 
                icon="pi pi-filter" 
                className="ml-auto align-self-end"
                onClick={() => {/* Filter logic here */}}
            />
        </div>
        
        {/* Course Info */}
        <div className="flex justify-content-between align-items-center p-3 bg-gray-100 border-round mb-4">
            <div>
                <span className="font-medium">Loaded Course: </span>
                <span>Kindergarten-Math | Total Students: 11</span>
            </div>
            <div className="flex gap-2">
                <Button 
                    label="Export CSV" 
                    icon="pi pi-download" 
                    severity="secondary" 
                    outlined 
                    size="small"
                />
                <Button 
                    label="Print" 
                    icon="pi pi-print" 
                    severity="secondary" 
                    outlined 
                    size="small"
                />
            </div>
        </div>
        
        {/* Progress Table */}
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="border-bottom-1 surface-border">
                        <th className="text-left p-3 font-medium">#</th>
                        <th className="text-left p-3 font-medium">Students</th>
                        <th className="text-left p-3 font-medium">Big Small an</th>
                        <th className="text-left p-3 font-medium">Count with or...</th>
                        <th className="text-left p-3 font-medium">Count with Pa R...</th>
                        <th className="text-left p-3 font-medium">Shadow Match...</th>
                        <th className="text-left p-3 font-medium">Assessment</th>
                        <th className="text-left p-3 font-medium">Number 1</th>
                        <th className="text-left p-3 font-medium">Numbers Song</th>
                        <th className="text-left p-3 font-medium">Overall</th>
                    </tr>
                </thead>
                <tbody>
                    {[
                        { id: 1, name: 'Haram Fatima', progress: ['✔', '✔', '—', '—', '✔', '✔', '—'], overall: '85%' },
                        { id: 2, name: 'Abeeha Ali', progress: ['67%', '—', '—', '—', '67%', '—', '—'], overall: '45%' },
                        { id: 3, name: 'Armish Faheem', progress: ['67%', '—', '67%', '—', '67%', '—', '67%'], overall: '67%' },
                        { id: 4, name: 'Anabia Abbas', progress: ['67%', '✔', '—', '—', '67%', '✔', '—'], overall: '72%' },
                        { id: 5, name: 'Zain Ali', progress: ['✔', '—', '—', '—', '✔', '—', '—'], overall: '60%' },
                        { id: 6, name: 'M. Talha Malik', progress: ['✔', '—', '33%', '—', '✔', '—', '33%'], overall: '55%' },
                        { id: 7, name: 'Pakiza Iyaz', progress: ['✔', '✔', '—', '—', '✔', '✔', '—'], overall: '80%' }
                    ].map((student) => (
                        <tr key={student.id} className="border-bottom-1 surface-border hover:surface-hover">
                            <td className="p-3">{student.id}</td>
                            <td className="p-3 font-medium">{student.name}</td>
                            {student.progress.map((item, index) => (
                                <td key={index} className="p-3">
                                    {item === '✔' ? (
                                        <i className="pi pi-check text-green-500"></i>
                                    ) : item === '—' ? (
                                        <span className="text-gray-400">—</span>
                                    ) : (
                                        <div className="flex align-items-center gap-2">
                                            <div className="relative w-8rem bg-gray-200 rounded" style={{ height: '6px' }}>
                                                <div 
                                                    className="absolute bg-primary-500 rounded" 
                                                    style={{ 
                                                        height: '6px', 
                                                        width: item 
                                                    }}
                                                ></div>
                                            </div>
                                            <span className="text-sm">{item}</span>
                                        </div>
                                    )}
                                </td>
                            ))}
                            <td className="p-3">
                                <div className="flex align-items-center gap-2">
                                    <div className="relative w-8rem bg-gray-200 rounded" style={{ height: '6px' }}>
                                        <div 
                                            className="absolute bg-primary-500 rounded" 
                                            style={{ 
                                                height: '6px', 
                                                width: student.overall 
                                            }}
                                        ></div>
                                    </div>
                                    <span className="font-medium">{student.overall}</span>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        
        {/* Pagination */}
        <div className="flex justify-content-between align-items-center mt-4">
            <div className="text-sm text-500">
                Showing 1 to 7 of 7 entries
            </div>
            <div className="flex gap-2">
                <Button icon="pi pi-angle-left" disabled rounded text />
                <Button label="1" rounded text />
                <Button icon="pi pi-angle-right" disabled rounded text />
            </div>
        </div>
    </div>
</div>

            {/* Recent Students Table */}
            <div className="col-12 lg:col-8">
                <div className="card">
                    <div className="flex flex-column md:flex-row md:align-items-start md:justify-content-between mb-3">
                        <div className="text-900 text-xl font-semibold mb-3 md:mb-0">
                            Recent Students
                        </div>
                        <div className="inline-flex align-items-center">
                            <span className="p-input-icon-left flex-auto">
                                <i className="pi pi-search"></i>
                                <InputText
                                    type={"text"}
                                    value={globalFilterValue}
                                    onChange={onGlobalFilterChange}
                                    placeholder="Search"
                                    style={{ borderRadius: "2rem" }}
                                    className="w-full"
                                />
                            </span>
                            <Tooltip target=".export-target-button" />
                            <Button
                                icon="pi pi-upload"
                                className="mx-3 export-target-button"
                                rounded
                                data-pr-tooltip="Export"
                                onClick={exportCSV}
                            ></Button>
                        </div>
                    </div>
                    <DataTable
                        ref={dt}
                        value={students}
                        dataKey="id"
                        paginator
                        rows={5}
                        className="datatable-responsive"
                        globalFilter={globalFilterValue}
                        emptyMessage="No students found."
                        responsiveLayout="scroll"
                    >
                        <Column
                            field="name"
                            header="Name"
                            sortable
                            body={nameBodyTemplate}
                            headerStyle={{ minWidth: "12rem" }}
                        ></Column>
                        <Column
                            field="class"
                            header="Class"
                            sortable
                            body={classBodyTemplate}
                            headerStyle={{ minWidth: "8rem" }}
                        ></Column>
                        <Column
                            field="grade"
                            header="Grade"
                            body={gradeBodyTemplate}
                            sortable
                            headerStyle={{ minWidth: "8rem" }}
                        ></Column>
                        <Column
                            field="status"
                            header="Status"
                            body={statusBodyTemplate}
                            sortable
                            headerStyle={{ minWidth: "10rem" }}
                        ></Column>
                        <Column
                            body={searchBodyTemplate}
                            style={{ textAlign: "center" }}
                        ></Column>
                    </DataTable>
                </div>
            </div>

            {/* Top Performing Students */}
            <div className="col-12 lg:col-4">
                <div className="card h-full">
                    <div className="text-900 text-xl font-semibold mb-3">
                        Top Performing Students
                    </div>
                    <ul className="list-none p-0 m-0">
                        {students.slice(0, 6).map((student, i) => {
                            return (
                                <li
                                    key={i}
                                    className="flex align-items-center justify-content-between p-3"
                                >
                                    <div className="inline-flex align-items-center">
                                        <Avatar
                                            image={`/demo/images/student/${student.image}`}
                                            size="large"
                                            shape="circle"
                                            className="mr-3"
                                        />
                                        <div className="flex flex-column">
                                            <span className="font-medium text-lg mb-1">
                                                {student.name}
                                            </span>
                                            <Rating
                                                value={student.performance / 20}
                                                readOnly
                                                cancel={false}
                                                onIconProps={{
                                                    style: { fontSize: "12px" },
                                                }}
                                                offIconProps={{
                                                    style: { fontSize: "12px" },
                                                }}
                                            ></Rating>
                                        </div>
                                    </div>
                                    <span className="ml-auto font-semibold text-xl p-text-secondary">
                                        {student.performance}%
                                    </span>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>
        </div>
    );
}