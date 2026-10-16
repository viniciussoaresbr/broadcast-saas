import { useState } from 'react'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Paper from '@mui/material/Paper'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import AddIcon from '@mui/icons-material/Add'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import ConfirmDialog from '../components/ConfirmDialog'
import ContactFormDialog from '../components/ContactFormDialog'
import EmptyState from '../components/EmptyState'
import ListState from '../components/ListState'
import { useConnectionContext } from '../hooks/useConnectionContext'
import { createContact, deleteContact, updateContact } from '../services/contact-service'
import type { Contact } from '../types'
import { formatPhone } from '../utils/phone'

type DialogState =
  | { type: 'create' }
  | { type: 'edit'; contact: Contact }
  | { type: 'delete'; contact: Contact }
  | null

const ContactsPage = () => {
  const { connection, contacts } = useConnectionContext()
  const [dialog, setDialog] = useState<DialogState>(null)
  const closeDialog = () => setDialog(null)

  const createButton = (
    <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialog({ type: 'create' })}>
      Novo contato
    </Button>
  )

  return (
    <section className="flex flex-col gap-4" aria-labelledby="contacts-title">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Typography id="contacts-title" variant="h6" component="h2">
          Contatos
          {contacts.data && contacts.data.length > 0 && (
            <Typography component="span" color="text.secondary" className="ml-2">
              ({contacts.data.length})
            </Typography>
          )}
        </Typography>
        {createButton}
      </div>

      <ListState
        state={contacts}
        empty={
          <EmptyState
            title="Nenhum contato nesta conexão"
            description="Adicione contatos para poder enviar mensagens."
            action={createButton}
          />
        }
      >
        {(items) => (
          <Paper variant="outlined">
            <List disablePadding>
              {items.map((contact, index) => (
                <ListItem
                  key={contact.id}
                  divider={index < items.length - 1}
                  className="pr-28"
                  secondaryAction={
                    <div className="flex gap-1">
                      <Tooltip title="Editar">
                        <IconButton
                          aria-label={`Editar ${contact.name}`}
                          onClick={() => setDialog({ type: 'edit', contact })}
                        >
                          <EditOutlinedIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Excluir">
                        <IconButton
                          aria-label={`Excluir ${contact.name}`}
                          onClick={() => setDialog({ type: 'delete', contact })}
                        >
                          <DeleteOutlineIcon />
                        </IconButton>
                      </Tooltip>
                    </div>
                  }
                >
                  <ListItemText
                    primary={contact.name}
                    secondary={formatPhone(contact.phone)}
                    slotProps={{ primary: { className: 'truncate font-medium' } }}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        )}
      </ListState>

      {dialog?.type === 'create' && (
        <ContactFormDialog
          open
          onSave={(values) => createContact({ connectionId: connection.id, ...values })}
          onClose={closeDialog}
        />
      )}
      {dialog?.type === 'edit' && (
        <ContactFormDialog
          open
          initialValues={dialog.contact}
          onSave={(values) => updateContact({ contactId: dialog.contact.id, ...values })}
          onClose={closeDialog}
        />
      )}
      {dialog?.type === 'delete' && (
        <ConfirmDialog
          open
          title="Excluir contato?"
          description={
            <>
              <strong>{dialog.contact.name}</strong> será removido desta conexão e das
              mensagens agendadas. Mensagens agendadas sem outros destinatários serão
              excluídas. O histórico de mensagens enviadas é mantido.
            </>
          }
          onConfirm={() => deleteContact({ contactId: dialog.contact.id })}
          onClose={closeDialog}
        />
      )}
    </section>
  )
}

export default ContactsPage
