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
    