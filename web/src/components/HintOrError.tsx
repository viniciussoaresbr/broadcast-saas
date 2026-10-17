type HintOrErrorProps = {
  hint: string;
  error?: string | null;
};

// Dica e erro ocupam a mesma célula do grid, então a linha não muda de altura.
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
