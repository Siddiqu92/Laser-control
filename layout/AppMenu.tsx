import type { MenuModel } from "@/types";
import AppSubMenu from "./AppSubMenu";

const AppMenu = () => {
    const model: MenuModel[] = [
        {
            label: "Dashboard",
            icon: "pi pi-home",
            items: [
                
            
                {
                    label: "Teacher Dashboard",
                    icon: "pi pi-fw pi-chart-bar",
                    to: "/dashboard",
                },
                
             
            ],
        },
        {
            label: "Schools",
            icon: "pi pi-building",
            items: [
                {
                    label: "Schools",
                    icon: "pi pi-fw pi-building",
                    to: "/schools",
                },
                {
                    label: "School Details",
                    icon: "pi pi-fw pi-info-circle",
                    to: "/schools/details",
                },
            ],
        },
        {
            label: "Users",
            icon: "pi pi-users",
            items: [
                {
                    label: "Teachers",
                    icon: "pi pi-fw pi-users",
                    to: "/teachers",
                },
                {
                    label: "Students",
                    icon: "pi pi-fw pi-user",
                    to: "/students",
                },
            ],
        },
        {
            label: "Academics",
            icon: "pi pi-book",
            items: [
                {
                    label: "Programs of Study",
                    icon: "pi pi-fw pi-book",
                    to: "/programs-of-study",
                },
                {
                    label: "Courses",
                    icon: "pi pi-fw pi-briefcase",
                    to: "/courses",
                },
             
            ],
        },
        {
            label: "Resources",
            icon: "pi pi-tablet",
            items: [
                {
                    label: "Devices",
                    icon: "pi pi-fw pi-tablet",
                    to: "/devices",
                },
                {
                    label: "Inventory",
                    icon: "pi pi-fw pi-box",
                    to: "/inventory",
                },
            ],
        },
        {
            label: "Settings",
            icon: "pi pi-cog",
            items: [
                {
                    label: "General Settings",
                    icon: "pi pi-fw pi-cog",
                    to: "/settings",
                },
             
            ],
        },
    ];

    return <AppSubMenu model={model} />;
};

export default AppMenu;
