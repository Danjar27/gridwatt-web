export interface StepperStep {
    id: string;
    label: string;
}

export interface StepperProps {
    /**
     * Array of steps to be rendered in the stepper.
     * Each step should have a unique `id` and a `label` to be displayed.
     */
    steps: ReadonlyArray<StepperStep>;
    /**
     * Index of the currently active step. This should be a zero-based
     * index corresponding to the {@link steps} array.
     */
    currentStep: number;
}
