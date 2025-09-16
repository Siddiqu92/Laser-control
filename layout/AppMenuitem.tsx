"use client";
import type { AppMenuItemProps } from "@/types";
import Link from "next/link";
import { Ripple } from "primereact/ripple";
import { classNames } from "primereact/utils";
import { useContext } from "react";
import { LayoutContext } from "./context/layoutcontext";
import { MenuContext } from "./context/menucontext";

const AppMenuitemStatic = (props: AppMenuItemProps) => {
  const { activeMenu, setActiveMenu } = useContext(MenuContext);
  const { layoutConfig } = useContext(LayoutContext);

  const item = props.item;
  const key = props.parentKey
    ? props.parentKey + "-" + props.index
    : String(props.index);

  const active =
    activeMenu === key || !!(activeMenu && activeMenu.startsWith(key + "-"));

  const itemClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (item?.disabled) {
      event.preventDefault();
      return;
    }

    // toggle submenu for static menu
    if (item?.items) {
      setActiveMenu(active ? props.parentKey! : key);
    } else {
      setActiveMenu(key);
    }

    if (item?.command) {
      item?.command({ originalEvent: event, item: item });
    }
  };

  const badge = item?.badge ? (
    <span
      className={classNames(
        "layout-menu-badge p-tag p-tag-rounded ml-2 uppercase",
        {
          [`${item?.badge}`]: true,
          "p-tag-success": item?.badge === "new",
          "p-tag-info": item?.badge === "updated",
        }
      )}
    >
      {item?.badge}
    </span>
  ) : null;

  const Menu =
    item?.items && item?.visible !== false ? (
      <ul>
        {item?.items.map((child, i) => {
          return (
            <AppMenuitemStatic
              item={child}
              index={i}
              className={child.badgeClass}
              parentKey={key}
              key={child.label}
            />
          );
        })}
      </ul>
    ) : null;

  return (
    <li
      className={classNames({
        "layout-root-menuitem": props.root,
        "active-menuitem": active,
        "layout-menuitem-static": true, // only static
      })}
      style={{
        listStyle: "none",
        display: "block",
        alignItems: "center",
      }}
    >
      {/* anchor if no routing */}
      {(!item?.to || item?.items) && item?.visible !== false ? (
        <a
          href={item?.url}
          onClick={(e) => itemClick(e)}
          className={classNames(item?.class, "p-ripple layout-menuitem-link")}
          target={item?.target}
          tabIndex={0}
          style={{
            display: "flex",
            alignItems: "center",
            padding: "10px 16px",
            textDecoration: "none",
          }}
        >
          <i
            className={classNames("layout-menuitem-icon", item?.icon)}
            style={{
              marginRight: "8px",
            }}
          ></i>
          <span className="layout-menuitem-text">{item?.label}</span>
          {badge}
          <Ripple />
        </a>
      ) : null}

      {/* link if routing */}
      {item?.to && !item?.items && item?.visible !== false ? (
        <Link
          href={item?.to}
          replace={item?.replaceUrl}
          onClick={(e) => itemClick(e)}
          className={classNames(item?.class, "p-ripple layout-menuitem-link")}
          tabIndex={0}
          style={{
            display: "flex",
            alignItems: "center",
            padding: "10px 16px",
            textDecoration: "none",
          }}
        >
          <i
            className={classNames("layout-menuitem-icon", item?.icon)}
            style={{
              marginRight: "8px",
            }}
          ></i>
          <span className="layout-menuitem-text">{item?.label}</span>
          {badge}
          <Ripple />
        </Link>
      ) : null}
      {Menu}
    </li>
  );
};

export default AppMenuitemStatic;
