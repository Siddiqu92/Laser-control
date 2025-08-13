import { Sidebar } from "primereact/sidebar";
import { useContext } from "react";
import { LayoutContext } from "./context/layoutcontext";
import Link from "next/link";
import { Avatar } from "primereact/avatar";

const AppProfileSidebar = () => {
    const { layoutState, setLayoutState } = useContext(LayoutContext);

    const onProfileSidebarHide = () => {
        setLayoutState((prevState) => ({
            ...prevState,
            profileSidebarVisible: false,
        }));
    };

    return (
        <Sidebar
            visible={layoutState.profileSidebarVisible}
            onHide={onProfileSidebarHide}
            position="right"
            className="layout-profile-sidebar w-full sm:w-25rem"
        >
            <div className="flex flex-column mx-auto md:mx-0">
                <div className="flex align-items-center mb-5">
                    <Avatar 
                        image="/demo/images/avatar/amyelsner.png" 
                        size="xlarge" 
                        shape="circle" 
                        className="mr-3"
                    />
                    <div>
                        <span className="text-900 font-semibold text-xl">Isabella Andolini</span>
                        <span className="text-color-secondary block mt-1">Administrator</span>
                    </div>
                </div>

                <ul className="list-none m-0 p-0">
                    <li>
                        <Link 
                            href="/profile" 
                            className="cursor-pointer flex surface-border mb-3 p-3 align-items-center border-1 surface-border border-round hover:surface-hover transition-colors transition-duration-150"
                            onClick={onProfileSidebarHide}
                        >
                            <span>
                                <i className="pi pi-user text-xl text-primary"></i>
                            </span>
                            <div className="ml-3">
                                <span className="mb-1 font-semibold">Profile</span>
                                <p className="text-color-secondary m-0">
                                    View and edit your profile
                                </p>
                            </div>
                        </Link>
                    </li>
                    <li>
                        <Link 
                            href="/auth/login" 
                            className="cursor-pointer flex surface-border mb-3 p-3 align-items-center border-1 surface-border border-round hover:surface-hover transition-colors transition-duration-150"
                            onClick={onProfileSidebarHide}
                        >
                            <span>
                                <i className="pi pi-sign-in text-xl text-primary"></i>
                            </span>
                            <div className="ml-3">
                                <span className="mb-1 font-semibold">Sign Out</span>
                                <p className="text-color-secondary m-0">
                                    Securely logout from system
                                </p>
                            </div>
                        </Link>
                    </li>
                </ul>
            </div>

            <div className="mt-auto pt-4 border-top-1 surface-border">
                <div className="flex justify-content-between text-color-secondary">
                    <span className="text-sm">v2.4.0</span>
                    <span className="text-sm">© 2023 Your Company</span>
                </div>
            </div>
        </Sidebar>
    );
};

export default AppProfileSidebar;