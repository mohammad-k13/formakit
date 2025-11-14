import React from "react";

export interface FormBuilderProps {
  /**
   * Optional className for styling
   */
  className?: string;
  /**
   * Optional children
   */
  children?: React.ReactNode;
  /**
   * Optional onSubmit handler
   */
  onSubmit?: (data: Record<string, any>) => void;
}

/**
 * FormBuilder component - A flexible form builder for React
 */
export const FormBuilder: React.FC<FormBuilderProps> = ({
  className,
  children,
  onSubmit,
}) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: Record<string, any> = {};

    formData.forEach((value, key) => {
      data[key] = value;
    });

    onSubmit?.(data);
  };

  return (
    <form className={className} onSubmit={handleSubmit}>
      {children || (
        <div
          style={{
            padding: "20px",
            border: "1px solid #ccc",
            borderRadius: "8px",
          }}
        >
          <h2>Form Builder222234234234234</h2>
          <p>Add form fields here</p>
        </div>
      )}
    </form>
  );
};
