import React, {
  memo,
  useState,
  useEffect,
  useRef,
  forwardRef,
} from 'react';
import type { ReactNode, ChangeEvent, FormEvent } from 'react';
import {
  motion,
  useAnimation,
  useInView,
  useMotionTemplate,
  useMotionValue,
} from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

// ==================== Input Component ====================

const Input = memo(
  forwardRef(function Input(
    { className, type, ...props }: React.InputHTMLAttributes<HTMLInputElement>,
    ref: React.ForwardedRef<HTMLInputElement>
  ) {
    const radius = 100;
    const [visible, setVisible] = useState(false);

    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    function handleMouseMove({
      currentTarget,
      clientX,
      clientY,
    }: React.MouseEvent<HTMLDivElement>) {
      const { left, top } = currentTarget.getBoundingClientRect();

      mouseX.set(clientX - left);
      mouseY.set(clientY - top);
    }

    return (
      <motion.div
        style={{
          background: useMotionTemplate`
        radial-gradient(
          ${visible ? radius + 'px' : '0px'} circle at ${mouseX}px ${mouseY}px,
          #3b82f6,
          transparent 80%
        )
      `,
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        className="group/input rounded-lg p-[2px] transition duration-300"
      >
        <input
          type={type}
          className={cn(
            `shadow-input flex h-10 w-full rounded-md border px-3 py-2 text-sm transition duration-300 file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 bg-white border-[#e5e2d9] text-[#191919] placeholder:text-zinc-400 focus-visible:ring-2 focus-visible:ring-[#cc5a37]/50 dark:bg-zinc-900 dark:border-zinc-800 dark:text-white dark:placeholder:text-zinc-600 dark:focus-visible:ring-zinc-600`,
            className
          )}
          ref={ref}
          {...props}
        />
      </motion.div>
    );
  })
);

Input.displayName = 'Input';

// ==================== BoxReveal Component ====================

type BoxRevealProps = {
  children: ReactNode;
  width?: string;
  boxColor?: string;
  duration?: number;
  overflow?: string;
  position?: string;
  className?: string;
};

const BoxReveal = memo(function BoxReveal({
  children,
  width = 'fit-content',
  boxColor,
  duration,
  overflow = 'hidden',
  position = 'relative',
  className,
}: BoxRevealProps) {
  const mainControls = useAnimation();
  const slideControls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      slideControls.start('visible');
      mainControls.start('visible');
    } else {
      slideControls.start('hidden');
      mainControls.start('hidden');
    }
  }, [isInView, mainControls, slideControls]);

  return (
    <section
      ref={ref}
      style={{
        position: position as
          | 'relative'
          | 'absolute'
          | 'fixed'
          | 'sticky'
          | 'static',
        width,
        overflow,
      }}
      className={className}
    >
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 75 },
          visible: { opacity: 1, y: 0 },
        }}
        initial="hidden"
        animate={mainControls}
        transition={{ duration: duration ?? 0.5, delay: 0.25 }}
      >
        {children}
      </motion.div>
      <motion.div
        variants={{ hidden: { left: 0 }, visible: { left: '100%' } }}
        initial="hidden"
        animate={slideControls}
        transition={{ duration: duration ?? 0.5, ease: 'easeIn' }}
        style={{
          position: 'absolute',
          top: 4,
          bottom: 4,
          left: 0,
          right: 0,
          zIndex: 20,
          background: boxColor ?? '#e05a47',
          borderRadius: 4,
        }}
      />
    </section>
  );
});

// ==================== Ripple Component ====================

type RippleProps = {
  mainCircleSize?: number;
  mainCircleOpacity?: number;
  numCircles?: number;
  className?: string;
};

const Ripple = memo(function Ripple({
  mainCircleSize = 210,
  mainCircleOpacity = 0.24,
  numCircles = 11,
  className = '',
}: RippleProps) {
  return (
    <section
      className={`max-w-[50%] absolute inset-0 flex items-center justify-center
        [mask-image:linear-gradient(to_bottom,black,transparent)]
        dark:[mask-image:linear-gradient(to_bottom,white,transparent)] ${className}`}
    >
      {Array.from({ length: numCircles }, (_, i) => {
        const size = mainCircleSize + i * 70;
        const opacity = mainCircleOpacity - i * 0.03;
        const animationDelay = `${i * 0.06}s`;
        const borderStyle = i === numCircles - 1 ? 'dashed' : 'solid';

        return (
          <span
            key={i}
            className="absolute animate-ripple rounded-full border border-black/10 dark:border-white/10"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              opacity: opacity,
              animationDelay: animationDelay,
              borderStyle: borderStyle,
              borderWidth: '1px',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          />
        );
      })}
    </section>
  );
});

// ==================== TechOrbitDisplay Component ====================

export type IconConfig = {
  className?: string;
  duration?: number;
  delay?: number;
  radius: number;
  path?: boolean;
  reverse?: boolean;
  component: () => React.ReactNode;
};

type TechnologyOrbitDisplayProps = {
  iconsArray: IconConfig[];
  text?: string;
};

const TechOrbitDisplay = memo(function TechOrbitDisplay({
  iconsArray,
  text = 'EduBase',
}: TechnologyOrbitDisplayProps) {
  // Extract unique radius values to render concentric SVG orbit rings ONCE
  const uniqueRadii = Array.from(new Set(iconsArray.map((i) => i.radius))).sort((a, b) => a - b);

  // Group icons by radius to calculate even angular spacing (360 / count)
  const iconsByRadius: { [radius: number]: IconConfig[] } = {};
  iconsArray.forEach((icon) => {
    if (!iconsByRadius[icon.radius]) {
      iconsByRadius[icon.radius] = [];
    }
    iconsByRadius[icon.radius].push(icon);
  });

  return (
    <section className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-lg z-10 select-none">
      {/* 1. Concentric SVG Orbit Path Rings */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="pointer-events-none absolute inset-0 size-full z-0"
      >
        {uniqueRadii.map((radius) => (
          <circle
            key={radius}
            className="stroke-black/15 dark:stroke-white/10 stroke-[1.5]"
            strokeDasharray="4 4"
            cx="50%"
            cy="50%"
            r={radius}
            fill="none"
          />
        ))}
      </svg>

      {/* 2. Central Brand Core */}
      <div className="relative z-20 flex flex-col items-center justify-center pointer-events-none">
        <span className="bg-gradient-to-b from-[#e05a47] to-[#cc5a37] dark:from-white dark:to-zinc-500 bg-clip-text text-center text-7xl font-extrabold tracking-tight leading-none text-transparent filter drop-shadow-xl">
          {text}
        </span>
      </div>

      {/* 3. Evenly Spaced Upright Orbiting Logos */}
      {uniqueRadii.map((radius) => {
        const group = iconsByRadius[radius];
        const count = group.length;

        return group.map((icon, idx) => {
          const startAngle = (360 / count) * idx;
          const duration = icon.duration || 25;
          const reverse = !!icon.reverse;

          return (
            <motion.div
              key={`${radius}-${idx}`}
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                width: '42px',
                height: '42px',
                marginLeft: '-21px',
                marginTop: '-21px',
                zIndex: 10,
              }}
              animate={{
                rotate: reverse
                  ? [startAngle, startAngle - 360]
                  : [startAngle, startAngle + 360],
              }}
              transition={{
                duration: duration,
                repeat: Infinity,
                ease: 'linear',
              }}
            >
              <div
                style={{
                  transform: `translateY(-${radius}px)`,
                  width: '42px',
                  height: '42px',
                }}
              >
                {/* Counter-rotate to keep icon upright */}
                <motion.div
                  animate={{
                    rotate: reverse
                      ? [-startAngle, -startAngle + 360]
                      : [-startAngle, -startAngle - 360],
                  }}
                  transition={{
                    duration: duration,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                  className="w-[42px] h-[42px] rounded-xl border shadow-lg backdrop-blur-md flex items-center justify-center bg-white/95 border-[#e5e2d9] text-[#191919] dark:bg-zinc-900/95 dark:border-zinc-700/80 dark:text-white transition-transform hover:scale-125 cursor-pointer"
                >
                  {icon.component()}
                </motion.div>
              </div>
            </motion.div>
          );
        });
      })}
    </section>
  );
});

// ==================== AnimatedForm Component ====================

export type FieldType = 'text' | 'email' | 'password' | string;

export type Field = {
  label: string;
  required?: boolean;
  type: FieldType;
  placeholder?: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

export type AnimatedFormProps = {
  header: string;
  subHeader?: string;
  fields: Field[];
  submitButton: string;
  textVariantButton?: string;
  errorField?: string;
  fieldPerRow?: number;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  googleLogin?: string;
  githubLogin?: string;
  onGoogleClick?: () => void;
  onGithubClick?: () => void;
  goTo?: (event: React.MouseEvent<HTMLButtonElement>) => void;
};

type Errors = {
  [key: string]: string;
};

const AnimatedForm = memo(function AnimatedForm({
  header,
  subHeader,
  fields,
  submitButton,
  textVariantButton,
  errorField,
  fieldPerRow = 1,
  onSubmit,
  onGoogleClick,
  onGithubClick,
  goTo,
}: AnimatedFormProps) {
  const [visible, setVisible] = useState<boolean>(false);
  const [errors, setErrors] = useState<Errors>({});

  const toggleVisibility = () => setVisible(!visible);

  const validateForm = (event: FormEvent<HTMLFormElement>) => {
    const currentErrors: Errors = {};
    fields.forEach((field) => {
      const value = (event.target as HTMLFormElement)[field.label]?.value;

      if (field.required && !value) {
        currentErrors[field.label] = `${field.label} is required`;
      }
    });
    return currentErrors;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formErrors = validateForm(event);

    if (Object.keys(formErrors).length === 0) {
      onSubmit(event);
    } else {
      setErrors(formErrors);
    }
  };

  return (
    <section className="max-md:w-full flex flex-col gap-4 w-96 mx-auto">
      <BoxReveal boxColor="var(--skeleton)" duration={0.3}>
        <h2 className="font-bold text-3xl text-zinc-900 dark:text-zinc-100">
          {header}
        </h2>
      </BoxReveal>

      {subHeader && (
        <BoxReveal boxColor="var(--skeleton)" duration={0.3} className="pb-2">
          <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-sm">
            {subHeader}
          </p>
        </BoxReveal>
      )}

      {/* Social Login Buttons Matching Theme System */}
      <div className="grid grid-cols-2 gap-3">
        <BoxReveal boxColor="var(--skeleton)" duration={0.3} overflow="visible" width="100%">
          <button
            className="g-button group/btn bg-white hover:bg-[#f5f2eb] border border-[#e5e2d9] text-[#191919] dark:bg-zinc-900/60 dark:hover:bg-zinc-800 dark:border-zinc-700/60 dark:text-zinc-200 w-full rounded-lg h-10 font-medium outline-hidden hover:cursor-pointer transition-all flex items-center justify-center gap-2.5 text-xs shadow-xs"
            type="button"
            onClick={onGoogleClick}
          >
            <img
              src="https://cdn1.iconfinder.com/data/icons/google-s-logo/150/Google_Icons-09-512.png"
              className="w-5 h-5"
              alt="Google Icon"
            />
            <span>Google</span>
            <BottomGradient />
          </button>
        </BoxReveal>

        <BoxReveal boxColor="var(--skeleton)" duration={0.3} overflow="visible" width="100%">
          <button
            className="g-button group/btn bg-white hover:bg-[#f5f2eb] border border-[#e5e2d9] text-[#191919] dark:bg-zinc-900/60 dark:hover:bg-zinc-800 dark:border-zinc-700/60 dark:text-zinc-200 w-full rounded-lg h-10 font-medium outline-hidden hover:cursor-pointer transition-all flex items-center justify-center gap-2.5 text-xs shadow-xs"
            type="button"
            onClick={onGithubClick}
          >
            <svg className="w-4 h-4 fill-current text-[#191919] dark:text-zinc-200" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            <span>GitHub</span>
            <BottomGradient />
          </button>
        </BoxReveal>
      </div>

      <BoxReveal boxColor="var(--skeleton)" duration={0.3} width="100%">
        <section className="flex items-center gap-4 py-1">
          <hr className="flex-1 border-1 border-dashed border-zinc-200 dark:border-zinc-800" />
          <p className="text-zinc-500 dark:text-zinc-400 text-[11px] uppercase tracking-widest font-semibold">
            or continue with
          </p>
          <hr className="flex-1 border-1 border-dashed border-zinc-200 dark:border-zinc-800" />
        </section>
      </BoxReveal>

      <form onSubmit={handleSubmit}>
        <section className={`grid grid-cols-1 md:grid-cols-${fieldPerRow} mb-4 gap-3`}>
          {fields.map((field) => (
            <section key={field.label} className="flex flex-col gap-1.5">
              <BoxReveal boxColor="var(--skeleton)" duration={0.3}>
                <Label htmlFor={field.label} className="text-zinc-800 dark:text-zinc-200 font-semibold">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </Label>
              </BoxReveal>

              <BoxReveal
                width="100%"
                boxColor="var(--skeleton)"
                duration={0.3}
                className="flex flex-col space-y-1.5 w-full"
              >
                <section className="relative">
                  <Input
                    type={
                      field.type === 'password'
                        ? visible
                          ? 'text'
                          : 'password'
                        : field.type
                    }
                    id={field.label}
                    placeholder={field.placeholder}
                    onChange={field.onChange}
                  />

                  {field.type === 'password' && (
                    <button
                      type="button"
                      onClick={toggleVisibility}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                    >
                      {visible ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </button>
                  )}
                </section>

                {errors[field.label] && (
                  <p className="text-red-500 text-xs">
                    {errors[field.label]}
                  </p>
                )}
              </BoxReveal>
            </section>
          ))}
        </section>

        <BoxReveal width="100%" boxColor="var(--skeleton)" duration={0.3}>
          {errorField && (
            <p className="text-red-500 text-sm mb-4">{errorField}</p>
          )}
        </BoxReveal>

        <BoxReveal
          width="100%"
          boxColor="var(--skeleton)"
          duration={0.3}
          overflow="visible"
        >
          <button
            className="relative group/btn bg-[#cc5a37] hover:bg-[#b84d2e] text-white dark:bg-zinc-800 dark:hover:bg-zinc-750 dark:text-white w-full rounded-md h-10 font-semibold shadow-md transition-all outline-hidden hover:cursor-pointer"
            type="submit"
          >
            {submitButton} &rarr;
            <BottomGradient />
          </button>
        </BoxReveal>

        {textVariantButton && goTo && (
          <BoxReveal boxColor="var(--skeleton)" duration={0.3}>
            <section className="mt-4 text-center hover:cursor-pointer">
              <button
                className="text-sm font-semibold text-[#cc5a37] hover:text-[#b84d2e] dark:text-blue-400 dark:hover:text-blue-300 hover:underline cursor-pointer outline-hidden transition-colors"
                onClick={goTo}
              >
                {textVariantButton}
              </button>
            </section>
          </BoxReveal>
        )}
      </form>
    </section>
  );
});

const BottomGradient = () => {
  return (
    <>
      <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
      <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
    </>
  );
};

// ==================== AuthTabs Component ====================

interface AuthTabsProps {
  formFields: {
    header: string;
    subHeader?: string;
    fields: Field[];
    submitButton: string;
    textVariantButton?: string;
  };
  goTo: (event: React.MouseEvent<HTMLButtonElement>) => void;
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onGoogleClick?: () => void;
  onGithubClick?: () => void;
}

const AuthTabs = memo(function AuthTabs({
  formFields,
  goTo,
  handleSubmit,
  onGoogleClick,
  onGithubClick,
}: AuthTabsProps) {
  return (
    <div className="flex max-lg:justify-center w-full md:w-auto">
      <div className="w-full h-[100dvh] flex flex-col justify-center items-center max-lg:px-[10%]">
        <AnimatedForm
          {...formFields}
          fieldPerRow={1}
          onSubmit={handleSubmit}
          goTo={goTo}
          onGoogleClick={onGoogleClick}
          onGithubClick={onGithubClick}
        />
      </div>
    </div>
  );
});

// ==================== Label Component ====================

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  htmlFor?: string;
}

const Label = memo(function Label({ className, ...props }: LabelProps) {
  return (
    <label
      className={cn(
        'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        className
      )}
      {...props}
    />
  );
});

export {
  Input,
  BoxReveal,
  Ripple,
  TechOrbitDisplay,
  AnimatedForm,
  AuthTabs,
  Label,
  BottomGradient,
};
