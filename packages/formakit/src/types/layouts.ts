import { GridLayoutProps, ResponsiveGridLayoutProps } from "react-grid-layout";
import { IField } from "./fields";

export interface IStaticLayout {
      type: "static",
      layouts: GridLayoutProps["layout"];
      gridConfig: GridLayoutProps["gridConfig"],
      fields: IField[];
}

export interface IResponsiveLayout {
      type: "responsive",
      layouts: ResponsiveGridLayoutProps["layouts"];
      fields: IField[];
}