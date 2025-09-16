import Link from "next/link";
import { useContext } from "react";
import AppMenu from "./AppMenu";
import { LayoutContext } from "./context/layoutcontext";
import { MenuProvider } from "./context/menucontext";
import { LayoutState } from "../types/layout";

const AppSidebar = () => {
    const { setLayoutState, layoutConfig } = useContext(LayoutContext);
    const anchor = () => {
        setLayoutState((prevLayoutState: LayoutState) => ({
            ...prevLayoutState,
            anchored: !prevLayoutState.anchored,
        }));
    };

    const showLogoText = layoutConfig?.menuMode === "static";

    return (
        <>
            <div className="sidebar-header">
                <Link
                    href="/"
                    className="app-logo flex items-center gap-2"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        textDecoration: "none",
                        width: "80%",
                        justifyContent: showLogoText ? "flex-start" : "center",
                    }}
                >
                    {/*  Logo Icon */}
                    <img
                        src="/shama.svg"
                        alt="Shama Logo"    
                        width={60}
                        height={60}
                        className="app-logo-icon"
                    />

                 {showLogoText && (
    <span
        className="app-logo-text"
        style={{
            fontFamily: "'Segoe UI', Arial, sans-serif",
            fontWeight: 640,
            fontSize: "22px",
            color: "var(--text-color)", 
            lineHeight: 1,
        }}
    >
        Shama
    </span>
)}

                
                </Link>

                <button
                    className="layout-sidebar-anchor p-link z-2 mb-2"
                    type="button"
                    onClick={anchor}
                ></button>
            </div>

            <div className="layout-menu-container">
                <MenuProvider>
                    <AppMenu />
                </MenuProvider>
            </div>

            {/*  Inline conditional styles */}
            <style jsx>{`
                /* Static → show text */
                .layout-menu-static .app-logo-text {
                    display: inline-block !important;
                }

                /* Other menu types → hide text & center icon */
                .layout-menu-overlay .app-logo-text,
                .layout-menu-slim .app-logo-text,
                .layout-menu-slim-plus .app-logo-text,
                .layout-menu-drawer .app-logo-text,
                .layout-menu-reveal .app-logo-text,
                .layout-menu-horizontal .app-logo-text {
                    display: none !important;
                }

                .layout-menu-overlay .app-logo,
                .layout-menu-slim .app-logo,
                .layout-menu-slim-plus .app-logo,
                .layout-menu-drawer .app-logo,
                .layout-menu-reveal .app-logo,
                .layout-menu-horizontal .app-logo {
                    justify-content: center !important;
                }
            `}</style>
        </>
    );
};

export default AppSidebar;
