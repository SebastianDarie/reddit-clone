import { NavBar } from './NavBar';
import { BackgroundVariant, Wrapper, WrapperVariant } from './Wrapper';

interface LayoutProps {
  background?: BackgroundVariant;
  variant?: WrapperVariant;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  background,
  variant,
}) => {
  return (
    <>
      <NavBar />
      <Wrapper background={background} variant={variant}>
        {children}
      </Wrapper>
    </>
  );
};
