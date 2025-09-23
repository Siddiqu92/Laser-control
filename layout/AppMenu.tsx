import type { MenuModel } from "@/types";
import AppSubMenu from "./AppSubMenu";

const AppMenu = () => {
    const model: MenuModel[] = [
        {
            label: "",
            icon: "pi pi-home",
            items: [
                
            
                {
                    label: "Teacher Dashboard",
                    icon: "pi pi-fw pi-chart-bar",
                    to: "/dashboard",
                },
                
             
         
                {
                    label: "Schools",
                    icon: "pi pi-fw pi-building",
                    to: "/schools",
                },
             
       
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
             
      
                {
                    label: "Devices",
                    icon: "pi pi-fw pi-tablet",
                    to: "/devices",
                },
            
          
                {
                    label: "Settings",
                    icon: "pi pi-fw pi-cog",
                    to: "/settings",
                },
             
            ],
        },
    ];

    return <AppSubMenu model={model} />;
};

export default AppMenu;
