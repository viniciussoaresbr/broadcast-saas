type HintOrErrorProps = {
  hint: string;
  error?: string | null;
};

/**
 * Helper text that shows the error in place of the hint. Both share one grid
 * cell, so the line keeps the height of the taller text whichever one is
 * visible and the form doesn't shift when validation fails.
 */
const HintOrError = ({ hint, error }: HintOrErrorProps) => (
  <span className="grid">
    <span className={`col-start-1 row-start-1 ${error ? 'invisible' : ''}`}>
      {hint}
    </span>
    <span className={`col-start-1 row-start-1 ${error ? '' : 'invisible'}`}>
      {error}
    </span>
  </span>
);

export default HintOrError;
