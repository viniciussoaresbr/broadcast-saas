import { useState } from 'react';
import TextField from '@mui/material/TextField';
import { useAsyncAction } from '../hooks/useAsyncAction';
import { NAME_MAX_LENGTH, validateName } from '../utils/validation';
import FormDialog from './FormDialog';

type ConnectionFormDialogProps = {
  open: boolean;
  initialName?: string;
  onSave: (name: string) => Promise<unknown>;
  onClose: () => void;
};

// Monte com uma `key` por item editado para o formulário iniciar com os valores dele.
const ConnectionFormDialog = ({
  open,
  initialName = '',
  onSave,
  onClose,
}: ConnectionFormDialogProps) => {
  const [name, setName] = useState(initialName);
  const [nameError, setNameError] = useState<string | null>(null);
  const { pending, error, run } = useAsyncAction();
  const isEditing = initialName !== '';

  const submit = async () => {
    const invalid = validateName(name);
    setNameError(invalid);
    if (invalid) return;
    if (await run(() => onSave(name))) onClose();
  };

  return (
    <FormDialog
      open={open}
      title={isEditing ? 'Renomear conexão' : 'Nova conexão'}
      description={
        isEditing
          ? undefined
          : 'Cada conexão agrupa seus próprios contatos e mensagens. Use um nome que a identifique, como a loja ou a campanha.'
      }
      submitLabel={isEditing ? 'Salvar' : 'Criar conexão'}
      pending={pending}
      error={error}
      onSubmit={submit}
      onClose={onClose}
    >
      <TextField
        label="Nome da conexão"
        name="connection-name"
        autoComplete="off"
        value={name}
        onChange={event => setName(event.target.value)}
        error={Boolean(nameError)}
        helperText={nameError ?? `${name.trim().length}/${NAME_MAX_LENGTH}`}
        slotProps={{ htmlInput: { maxLength: NAME_MAX_LENGTH } }}
        required
        autoFocus
      />
    </FormDialog>
  );
};

export default ConnectionFormDialog;
