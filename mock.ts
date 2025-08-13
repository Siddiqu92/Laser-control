// /src/mock/schoolMockData.ts
export const schoolMockData = {
    students: [
        { id: '1', name: 'John Smith', class: '10A', grade: 'A', attendance: '95%', status: 'Active', performance: 92, image: 'student1.jpg' },
        { id: '2', name: 'Emily Johnson', class: '11B', grade: 'A+', attendance: '98%', status: 'Active', performance: 95, image: 'student2.jpg' },
        { id: '3', name: 'Michael Brown', class: '9C', grade: 'B', attendance: '88%', status: 'Active', performance: 85, image: 'student3.jpg' },
        { id: '4', name: 'Sarah Davis', class: '12A', grade: 'A', attendance: '94%', status: 'Active', performance: 90, image: 'student4.jpg' },
        { id: '5', name: 'David Wilson', class: '8B', grade: 'B+', attendance: '90%', status: 'Active', performance: 87, image: 'student5.jpg' },
        { id: '6', name: 'Jessica Lee', class: '10B', grade: 'A-', attendance: '92%', status: 'Active', performance: 89, image: 'student6.jpg' },
    ],

    timePeriods: [
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
    ],

    stats: {
        students: { count: 1254, change: '+12%' },
        teachers: { count: 84, change: '+5%' },
        classes: { count: 36, change: '+2' },
        attendance: { count: '94%', change: '+3%' }
    },

    subjectProgress: {
        courseInfo: {
            name: "Kindergarten-Math",
            totalStudents: 11
        },
        students: [
            { id: 1, name: 'Haram Fatima', progress: ['✔', '✔', '—', '—', '✔', '✔', '—'], overall: '85%' },
            { id: 2, name: 'Abeeha Ali', progress: ['67%', '—', '—', '—', '67%', '—', '—'], overall: '45%' },
            { id: 3, name: 'Armish Faheem', progress: ['67%', '—', '67%', '—', '67%', '—', '67%'], overall: '67%' },
            { id: 4, name: 'Anabia Abbas', progress: ['67%', '✔', '—', '—', '67%', '✔', '—'], overall: '72%' },
            { id: 5, name: 'Zain Ali', progress: ['✔', '—', '—', '—', '✔', '—', '—'], overall: '60%' },
            { id: 6, name: 'M. Talha Malik', progress: ['✔', '—', '33%', '—', '✔', '—', '33%'], overall: '55%' },
            { id: 7, name: 'Pakiza Iyaz', progress: ['✔', '✔', '—', '—', '✔', '✔', '—'], overall: '80%' }
        ],
        subjects: [
            'Big Small an',
            'Count with or...',
            'Count with Pa R...',
            'Shadow Match...',
            'Assessment',
            'Number 1',
            'Numbers Song'
        ]
    },

    chartData: {
        pieData: {
            labels: ["Science", "Arts", "Commerce"],
            datasets: [
                {
                    data: [45, 25, 30],
                    backgroundColor: ["#4547a9", "#8183f4", "#dadafc"],
                    hoverBackgroundColor: ["#5457cd", "#9ea0f6", "#bcbdf9"],
                },
            ],
        },
        getBarData: (selectedPeriod: number) => ({
            labels: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6", "Week 7"],
            datasets: [
                {
                    label: "Attendance Rate",
                    backgroundColor: "#6366f1",
                    barThickness: 12,
                    borderRadius: 12,
                    data: schoolMockData.timePeriods[selectedPeriod].data[0],
                },
                {
                    label: "Performance Score",
                    backgroundColor: "#bcbdf9",
                    barThickness: 12,
                    borderRadius: 12,
                    data: schoolMockData.timePeriods[selectedPeriod].data[1],
                },
            ],
        })
    },

    chartOptions: {
        pieOptions: {
            animation: { duration: 0 },
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: "#1e293b",
                        usePointStyle: true,
                        font: { weight: "700" },
                        padding: 28,
                    },
                    position: "bottom",
                },
            },
        },
        barOptions: {
            animation: { duration: 0 },
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: "#1e293b",
                        usePointStyle: true,
                        font: { weight: "700" },
                        padding: 28,
                    },
                    position: "bottom",
                },
            },
            scales: {
                x: {
                    ticks: {
                        color: "#64748b",
                        font: { weight: "500" },
                    },
                    grid: { display: false },
                },
                y: {
                    min: 70,
                    max: 100,
                    ticks: {
                        color: "#64748b",
                        callback: (value: any) => value + '%'
                    },
                    grid: { color: "#dfe7ef" },
                },
            },
        }
    },

    filterOptions: {
        grades: [
            { label: 'All Grades', value: 'all' },
            { label: 'Kindergarten', value: 'kindergarten' },
            { label: 'Grade 1', value: 'grade1' },
            { label: 'Grade 2', value: 'grade2' },
            { label: 'Grade 3', value: 'grade3' },
            { label: 'Grade 4', value: 'grade4' },
             { label: 'Grade 5', value: 'grade5' },
            { label: 'Grade 6', value: 'grade6' },
            { label: 'Grade 7', value: 'grade7' },
            { label: 'Grade 8', value: 'grade8' },
            { label: 'Grade 9', value: 'grade9' },
            { label: 'Grade 10', value: 'grade10' }
    
        ],
        subjects: [
            { label: 'All Subjects', value: 'all' },
            { label: 'Math', value: 'math' },
            { label: 'Science', value: 'science' },
            { label: 'English', value: 'english' },
             { label: 'Urdu', value: 'urdu' },
            { label: 'Physics', value: 'physics' }
        ],
        statuses: [
            { label: 'Read', value: 'read' },
            { label: 'Unread', value: 'unread' },
            { label: 'Failed', value: 'failed' }
        ]
    }
};