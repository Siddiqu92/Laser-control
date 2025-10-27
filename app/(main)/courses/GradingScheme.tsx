import React from "react";
import { Card } from "primereact/card";
import { Chart } from "primereact/chart";
import { LessonData } from "./types/courseTypes";
export interface GradingSchemeProps {
  lessons: LessonData[];
  courseId?: string; 
}
const GradingScheme: React.FC<GradingSchemeProps> = ({ lessons }) => {
  const gradingItems: Record<string, number> = {};
  lessons?.forEach((lesson) => {
    if ((lesson.type === "assessment" || lesson.type === "exam") && lesson.weightage) {
      const key = lesson.name?.toLowerCase().includes("assessment") ? "Assessment" : lesson.name;

      if (!gradingItems[key]) {
        gradingItems[key] = 0;
      }
      gradingItems[key] += lesson.weightage ?? 0;
    }
    lesson.children?.forEach((child) => {
      if ((child.type === "assessment" || child.type === "exam") && child.weightage) {
        const key = child.name?.toLowerCase().includes("assessment") ? "Assessment" : child.name;
        if (!gradingItems[key]) {
          gradingItems[key] = 0;
        }
        gradingItems[key] += typeof child.weightage === 'number' ? child.weightage : 0;
      }
    });
  });
  const chartData = {
    labels: Object.keys(gradingItems),
    datasets: [
      {
        data: Object.values(gradingItems),
        backgroundColor: [
          '#FF6384', 
          '#36A2EB', 
          '#FFCE56', 
          '#4BC0C0', 
          '#9966FF', 
          '#FF9F40', 
          '#FF6384', 
          '#C9CBCF'  
        ],
        hoverBackgroundColor: [
          '#FF6384',
          '#36A2EB', 
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
          '#FF6384',
          '#C9CBCF'
        ]
      }
    ]
  };
  const chartOptions = {
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.parsed || 0;
            return `${label}: ${value}%`;
          }
        }
      }
    },
    cutout: '0%',
    maintainAspectRatio: false
  };
  return (
    <Card title="Grading Scheme" className="mb-4">
      <div className="p-3">
        <div className="grid mb-4">
          {Object.entries(gradingItems).map(([name, weight]) => (
            <div key={name} className="col-12 md:col-6">
              <div className="surface-100 p-3 border-round mb-2">
                <div className="font-semibold text-900">{name}</div>
                <div className="text-primary font-bold">{weight ?? 0}%</div>
              </div>
            </div>
          ))}
        </div>
        {Object.keys(gradingItems).length > 0 && (
          <div>
            <div className="text-900 font-semibold mb-3">Grade Distribution</div>
            <div className="flex justify-content-center">
              <div style={{ height: '300px', width: '100%', maxWidth: '400px' }}>
                <Chart 
                  type="pie" 
                  data={chartData} 
                  options={chartOptions} 
                  style={{ width: '100%', height: '100%' }} 
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
export default GradingScheme;