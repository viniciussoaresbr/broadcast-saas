import { useState } from 'react';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';
import ConfirmDialog from '../components/ConfirmDialog';
import ContactFormDialog from '../components/ContactFormDialog';
import EmptyState from '../components/EmptyState';
import Initials from '../components/Initials';
import ListState from '../components/ListState';
import { useConnectionContext } from '../hooks/useConnectionContext';
import { useFeedback } from '../hooks/useFeedback';
import {
  createContact,
  deleteContact,
  updateContact,
} from '../services/contact-service';
import type { Contact } from '../types';
import { formatPhone } from '../utils/phone';

type DialogState =
  | { type: 'create' }
  | { type: 'edit'; contact: Contact }
  | { type: 'delete'; contact: Contact }
  | null;

const ContactsPage = () => {
  const { connection, contacts } = useConnectionContext();
  const notify = useFeedback();
  const [dialog, setDialog] = useState<DialogState>(null);
  const closeDialog = () => setDialog(null);

  const createButton = (
    <Button
      variant="contained"
      startIcon={<AddIcon />}
      onClick={() => setDialog({ type: 'create' })}
    >
      Novo contato
    </Button>
  );

  return (
    <section className="flex flex-col gap-4" aria-labelledby="contacts-title">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          {/* The tab already shows "Contatos"; the heading stays for screen readers. */}
          <Typography id="contacts-title" variant="h2" className="sr-only">
            Contatos
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Quem pode receber as mensagens desta conexão.
          </Typography>
        </div>
        {contacts.data && contacts.data.length > 0 && createButton}
      </div>

      <ListState
        state={contacts}
        empty={
          <EmptyState
            icon={<PersonAddAltOutlinedIcon />}
            title="Nenhum contato nesta conexão"
            description="Adicione contatos para poder enviar mensagens."
            action={createButton}
          />
        }
      >
        {items => (
          <ul className="flex flex-col">
            {items.map(contact => (
              <li
                key={contact.id}
                className="flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-tone-100 sm:px-3"
              >
                <Initials name={contact.name} />
                <div className="flex min-w-0 flex-1 flex-col sm:flex-row sm:items-center sm:gap-6">
                  <span className="truncate text-[0.9375rem] font-medium text-ink sm:flex-1">
                    {contact.name}
                  </span>
                  <span className="tabular text-sm text-muted sm:w-40">
                    {formatPhone(contact.phone)}
                  </span>
                </div>
                <div className="flex shrink-0 gap-0.5">
                  <Tooltip title="Editar">
                    <IconButton
                      size="small"
                      aria-label={`Editar ${contact.name}`}
                      onClick={() => setDialog({ type: 'edit', contact })}
                    >
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Excluir">
                    <IconButton
                      size="small"
                      aria-label={`Excluir ${contact.name}`}
                      onClick={() => setDialog({ type: 'delete', contact })}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </div>
              </li>
            ))}
          </ul>
        )}
      </ListState>

      {dialog?.type === 'create' && (
        <ContactFormDialog
          open
          onSave={async values => {
            await createContact({ connectionId: connection.id, ...values });
            notify('Contato adicionado.');
          }}
          onClose={closeDialog}
        />
      )}
      {dialog?.type === 'edit' && (
        <ContactFormDialog
          open
          initialValues={dialog.contact}
          onSave={async values => {
            await updateContact({ contactId: dialog.contact.id, ...values });
            notify('Contato atualizado.');
          }}
          onClose={closeDialog}
        />
      )}
      {dialog?.type === 'delete' && (
        <ConfirmDialog
          open
          title="Excluir contato?"
          description={
            <>
              <strong className="font-semibold text-ink">
                {dialog.contact.name}
              </strong>{' '}
              será removido desta conexão e das mensagens agendadas. Mensagens
              agendadas sem outros destinatários serão excluídas. O histórico de
              mensagens enviadas é mantido.
            </>
          }
          confirmLabel="Excluir contato"
          onConfirm={() => deleteContact({ contactId: dialog.contact.id })}
          onConfirmed={() => notify('Contato excluído.')}
          onClose={closeDialog}
        />
      )}
    </section>
  );
};

export default ContactsPage;
