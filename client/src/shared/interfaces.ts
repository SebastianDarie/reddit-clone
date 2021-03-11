export interface FormProps {
  children: React.ReactNode;
  isSubmitting?: boolean;
}

export interface FormValues {
  title: string;
  text: string;
  link: string;
  image: File;
}
