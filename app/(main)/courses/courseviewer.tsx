"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "primereact/card";
import { Tree } from "primereact/tree";
import { Button } from "primereact/button";
import { Avatar } from "primereact/avatar";
import { useRouter } from "next/navigation";
import { Accordion, AccordionTab } from "primereact/accordion";

export interface CourseDetails {
  id: number;
  name: string;
  description: string | null;
  program_of_study: string | null;
  session: string | null;
  status: string;
}

type ComponentType = "learning_object" | "assessment" | "exam" | "fun_activity";

interface CourseComponentItem {
  component_type: ComponentType;
  id: number;
  sort: number;
  learning_objects: Array<{ learning_object_id: { id: number; name: string } }>;
  assessments: Array<{ id: number; name: string; weightage?: number }>;
}

interface CourseViewerProps {
  course?: CourseDetails | null;
  courseId?: string;
}

export default function CourseViewer({ course: initialCourse, courseId }: CourseViewerProps) {
  const router = useRouter();
  const [activeAccordionTab, setActiveAccordionTab] = useState<number>(0); // 0: Course Index, 1: Course Info, 2: Grading Scheme
  const [course, setCourse] = useState<CourseDetails | null>(initialCourse ?? null);
  const [components, setComponents] = useState<CourseComponentItem[]>([]);
  const [nodes, setNodes] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [expandedKeys, setExpandedKeys] = useState<Record<string, boolean>>({});

  const dummyCourse: CourseDetails = {
    id: 81,
    description: "G1 Urdu - I course covering basic language skills and vocabulary for Grade 1 students.",
    status: "execute",
    name: "G1 Urdu - I (2025-2026)",
    session: "2025-2026",
    program_of_study: "Grade 1",
  } as CourseDetails;

  const dummyComponents: CourseComponentItem[] = [
    {
      component_type: "learning_object",
      id: 1220,
      sort: 1,
      learning_objects: [
        { learning_object_id: { id: 1, name: "1- Urdu Alphabets – An Overview" } },
        { learning_object_id: { id: 2, name: "2- Basic Vocabulary – An Overview" } },
        { learning_object_id: { id: 3, name: "3- Sentence Formation – An Overview" } },
        { learning_object_id: { id: 4, name: "4- Reading Practice – An Overview" } },
      ],
      assessments: [],
    },
    {
      component_type: "assessment",
      id: 1221,
      sort: 2,
      learning_objects: [],
      assessments: [
        { id: 5, name: "5- Alphabet Recognition Test", weightage: 10 },
        { id: 6, name: "6- Vocabulary Assessment", weightage: 10 },
        { id: 7, name: "7- Writing Skills Test", weightage: 10 },
        { id: 8, name: "8- Oral Presentation", weightage: 10 },
      ],
    },
    {
      component_type: "assessment",
      id: 1222,
      sort: 3,
      learning_objects: [],
      assessments: [
        { id: 9, name: "1- Mid-term Examination", weightage: 15 },
        { id: 10, name: "2- Project Submission", weightage: 15 },
        { id: 11, name: "3- Practical Assessment", weightage: 15 },
        { id: 12, name: "4- Final Review", weightage: 15 },
      ],
    },
    {
      component_type: "learning_object",
      id: 1223,
      sort: 4,
      learning_objects: [
        { learning_object_id: { id: 13, name: "Course Information" } },
        { learning_object_id: { id: 14, name: "Grading Scheme" } },
      ],
      assessments: [],
    },
  ];

  useEffect(() => {
    // Simulate API call
    const localDummyCourse = dummyCourse;
    const localDummyComponents = dummyComponents;

    const timer = setTimeout(() => {
      setCourse((prev) => prev ?? localDummyCourse);
      setComponents(localDummyComponents);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [courseId]);

  type TreeNode = {
    key: string;
    label: any;
    data?: any;
    children?: TreeNode[];
    draggable?: boolean;
    droppable?: boolean;
  };

  const activityIcon = (type: ComponentType) => {
    switch (type) {
      case "learning_object":
        return "📘";
      case "assessment":
        return "📝";
      case "exam":
        return "🧾";
      case "fun_activity":
        return "🎯";
      default:
        return "";
    }
  };

  useEffect(() => {
    const newNodes: TreeNode[] = components
      .sort((a, b) => a.sort - b.sort)
      .map((comp, index) => {
        let label = "";
        let isHeader = false;

        if (comp.sort === 1) {
          label = "Course Index";
          isHeader = true;
        } else if (comp.sort === 2) {
          label = "Assessment - 1 - Weightage : 10%";
          isHeader = true;
        } else if (comp.sort === 3) {
          label = "Assessment - 2 - Weightage : 15%";
          isHeader = true;
        } else if (comp.sort === 4) {
          label = "Course Resources";
          isHeader = true;
        }

        const children: TreeNode[] = [];

        if (comp.component_type === "learning_object") {
          (comp.learning_objects || []).forEach((lo, idx) => {
            children.push({
              key: `${comp.id}-lo-${idx}`,
              label: (
                <div className="flex align-items-center justify-content-between w-full">
                  <span className="pl-3">{lo.learning_object_id.name}</span>
                  <div className="flex gap-3 pr-2">
                    <i className="pi pi-book text-primary cursor-pointer" />
                    <i className="pi pi-file text-primary cursor-pointer" />
                    <i className="pi pi-list text-primary cursor-pointer" />
                  </div>
                </div>
              ),
              data: { type: comp.component_type, isLeaf: true },
              draggable: true,
              droppable: false,
            });
          });
        }

        if (comp.component_type === "assessment") {
          (comp.assessments || []).forEach((ass, idx) => {
            children.push({
              key: `${comp.id}-ass-${idx}`,
              label: (
                <div className="flex align-items-center justify-content-between w-full">
                  <span className="pl-3">{ass.name}</span>
                  <div className="flex gap-3 pr-2">
                    <i className="pi pi-book text-primary cursor-pointer" />
                    <i className="pi pi-file text-primary cursor-pointer" />
                    <i className="pi pi-list text-primary cursor-pointer" />
                  </div>
                </div>
              ),
              data: { type: comp.component_type, isLeaf: true },
              draggable: true,
              droppable: false,
            });
          });
        }

        return {
          key: `${comp.id}`,
          label: (
            <div className={`flex align-items-center w-full ${isHeader ? 'font-bold text-900' : ''}`}>
              <span>{label}</span>
            </div>
          ),
          data: { type: comp.component_type, sort: comp.sort, isHeader: isHeader, isLeaf: false },
          children: children.length > 0 ? children : undefined,
          draggable: false,
          droppable: true,
        } as TreeNode;
      });
    setNodes(newNodes);
  }, [components]);

  const nameBodyTemplate = (node: any) => {
    const label: string = node.data.name;
    const isLeaf = node.data.isLeaf;
    const isHeader = node.data.isHeader;
    const nodeKey: string = node.key;
    const hasChildren: boolean = !!node.children && node.children.length > 0;
    const isExpanded: boolean = !!expandedKeys[nodeKey];

    const handleLeafClick = () => {
      if (!isLeaf) return;
        console.log(`Clicked: ${label}`, node.data);
    };

    const toggleExpand = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!hasChildren) return;
      setExpandedKeys((prev) => ({ ...prev, [nodeKey]: !prev[nodeKey] }));
    };

    return (
      <div 
        className={`${isLeaf ? 'cursor-pointer text-primary hover:underline' : 'cursor-pointer'} ${
          isHeader ? 'font-bold text-900' : 'text-700'
        } flex align-items-center`}
        onClick={hasChildren ? toggleExpand : handleLeafClick}
        style={{ paddingLeft: isLeaf ? '20px' : '0' }}
      >
        {hasChildren && (
          <i
            className={`mr-2 pi ${isExpanded ? 'pi-chevron-down' : 'pi-chevron-right'}`}
            aria-hidden
          />
        )}
        <span>{label}</span>
      </div>
    );
  };

  const activityBodyTemplate = (node: any) => {
    const isLeaf = node.data.isLeaf;
    if (!isLeaf) return null;

    const onClick = (action: string) => {
      console.log(`${action} clicked`, node.data);
    };

    return (
      <div className="flex justify-content-end gap-3 pr-2">
        <i className="pi pi-book text-primary cursor-pointer" title="Open" onClick={() => onClick('Open')} />
        <i className="pi pi-file text-primary cursor-pointer" title="Notes" onClick={() => onClick('Notes')} />
        <i className="pi pi-list text-primary cursor-pointer" title="Activity" onClick={() => onClick('Activity')} />
      </div>
    );
  };

  const renderRightPanelContent = () => {
    switch (activeAccordionTab) {
      case 0: // Course Index
        return (
          <Card title="Course Index" className="mb-4">
            <Tree
              value={nodes}
              expandedKeys={expandedKeys}
              onToggle={(e) => setExpandedKeys(e.value)}
              dragdropScope="course-reorder"
              onDragDrop={(e) => setNodes(e.value)}
              className="w-full"
            />
          </Card>
        );
      
      case 1: // Course Information
        return (
          <Card title="Course Information" className="mb-4">
            <div className="grid text-sm p-3">
              <div className="col-12 md:col-6 mb-3">
                <div className="text-600 font-medium mb-1">Program/Grade</div>
                <div className="text-900 font-semibold">{course?.program_of_study || "-"}</div>
              </div>
              <div className="col-12 md:col-6 mb-3">
                <div className="text-600 font-medium mb-1">Session</div>
                <div className="text-900 font-semibold">{course?.session || "-"}</div>
              </div>
              <div className="col-12 mb-3">
                <div className="text-600 font-medium mb-1">Course Status</div>
                <div className="text-900 font-semibold">
                  <span className={`p-tag p-tag-${course?.status === 'execute' ? 'success' : 'warning'}`}>
                    {course?.status || "Unknown"}
                  </span>
                </div>
              </div>
              <div className="col-12">
                <div className="text-600 font-medium mb-1">Description</div>
                <div className="text-900 line-height-3">{course?.description || "No description available."}</div>
              </div>
            </div>
          </Card>
        );
      
      case 2: // Grading Scheme
        return (
          <Card title="Grading Scheme" className="mb-4">
            <div className="p-3">
              <div className="text-600 font-medium mb-3">Assessment Weightage Distribution:</div>
              <div className="grid">
                <div className="col-12 md:col-6">
                  <div className="surface-100 p-3 border-round mb-2">
                    <div className="font-semibold">Assessment 1</div>
                    <div className="text-primary font-bold">10%</div>
                    <div className="text-sm text-600">Alphabet & Vocabulary Tests</div>
                  </div>
                </div>
                <div className="col-12 md:col-6">
                  <div className="surface-100 p-3 border-round mb-2">
                    <div className="font-semibold">Assessment 2</div>
                    <div className="text-primary font-bold">15%</div>
                    <div className="text-sm text-600">Mid-term & Projects</div>
                  </div>
                </div>
                <div className="col-12 md:col-6">
                  <div className="surface-100 p-3 border-round mb-2">
                    <div className="font-semibold">Final Examination</div>
                    <div className="text-primary font-bold">50%</div>
                    <div className="text-sm text-600">Comprehensive Test</div>
                  </div>
                </div>
                <div className="col-12 md:col-6">
                  <div className="surface-100 p-3 border-round mb-2">
                    <div className="font-semibold">Participation</div>
                    <div className="text-primary font-bold">15%</div>
                    <div className="text-sm text-600">Class Activities</div>
                  </div>
                </div>
                <div className="col-12 md:col-6">
                  <div className="surface-100 p-3 border-round">
                    <div className="font-semibold">Projects</div>
                    <div className="text-primary font-bold">10%</div>
                    <div className="text-sm text-600">Creative Assignments</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        );
      
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="layout-main p-4 flex justify-content-center align-items-center" style={{ height: '80vh' }}>
        <div className="text-center">
          <i className="pi pi-spin pi-spinner text-4xl text-primary mb-3"></i>
          <div>Loading course data...</div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="layout-main p-4">
        <div className="p-4 text-center">
          <i className="pi pi-exclamation-triangle text-4xl text-warning mb-3"></i>
          <div className="text-xl font-semibold">Course not found</div>
          <Button 
            label="Back to Courses" 
            icon="pi pi-arrow-left" 
            className="p-button-text mt-3" 
            onClick={() => router.push("/courses")}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="layout-main p-4">
      {/* Header Section */}
      <div className="flex justify-content-between align-items-center mb-4">
        <h1 className="m-0 text-3xl font-bold text-900">{course.name}</h1>
        <Button 
          icon="pi pi-arrow-left" 
          label="Back" 
          className="p-button-text" 
          onClick={() => router.push("/courses")}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid">
        {/* Left Column - Course Avatar and Accordion */}
        <div className="col-12 lg:col-3">
          {/* Course Avatar Card */}
          <Card className="mb-4">
            <div className="flex flex-column align-items-center text-center">
              <Avatar 
                icon="pi pi-book" 
                size="xlarge" 
                shape="circle" 
                className="bg-primary mb-3"
                style={{ fontSize: '2rem', width: '80px', height: '80px' }}
              />
              <div className="text-xl font-bold text-900">{course.name}</div>
              <div className="text-600 text-sm mt-1">{course.program_of_study}</div>
              <div className="text-500 text-sm">{course.session}</div>
            </div>
          </Card>


    {/* Sidebar Menu - Only Clickable Items */}
<div className="surface-card p-3 border-round shadow-2 mb-4">
  <ul className="list-none p-0 m-0">
    <li 
      className="p-3 cursor-pointer flex align-items-center gap-2 hover:surface-hover border-round" 
      onClick={() => setActiveAccordionTab(0)}
    >
      <i className="pi pi-list"></i>
      <span>Course Index</span>
    </li>

    <li 
      className="p-3 cursor-pointer flex align-items-center gap-2 hover:surface-hover border-round" 
      onClick={() => setActiveAccordionTab(1)}
    >
      <i className="pi pi-info-circle"></i>
      <span>Course Information</span>
    </li>

    <li 
      className="p-3 cursor-pointer flex align-items-center gap-2 hover:surface-hover border-round" 
      onClick={() => setActiveAccordionTab(2)}
    >
      <i className="pi pi-percentage"></i>
      <span>Grading Scheme</span>
    </li>
  </ul>
</div>

        </div>

        {/* Right Column - Dynamic Content */}
        <div className="col-12 lg:col-9">
          {renderRightPanelContent()}
        </div>
      </div>
    </div>
  );
}