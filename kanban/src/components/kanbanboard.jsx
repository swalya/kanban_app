import { useState, useEffect } from 'react';
import {
createTheme,
ThemeProvider,
Button,
Card,
CardActions,
CardContent,
CardHeader,
Divider,
Grid,
IconButton,
Menu,
MenuItem,
TextField,
Typography,
} from '@mui/material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Dialog, DialogActions, DialogContent } from '@mui/material';

const KanbanBoard = () => {
const [data, setData] = useState({
columns: [],
});
const [open, setOpen] = useState(false);
const [addColumnOpen, setAddColumnOpen] = useState(false);
const [newColumnName, setNewColumnName] = useState('');
const [newTask, setNewTask] = useState({ title: '' });
const [selectedColumnId, setSelectedColumnId] = useState(null);
const [menuAnchor, setMenuAnchor] = useState(null);
const [renameColumnOpen, setRenameColumnOpen] = useState(false);
const [newColumnTitle, setNewColumnTitle] = useState('');
const [taskError, setTaskError] = useState('');
const [columnError, setColumnError] = useState('');
const [editCardId, setEditCardId] = useState(null);
const [deleteCardId, setDeleteCardId] = useState(null);

useEffect(() => {
// Save data to backend or perform other actions when data changes
// For simplicity, this is an empty useEffect. You can add your logic here.
}, [data]);

const handleOpen = (columnId, cardId) => {
setSelectedColumnId(columnId);
setEditCardId(cardId);
setNewTask({
title:
data.columns.find((col) => col.id === columnId)?.cards.find((card) => card.id === cardId)?.title || '',
});
setOpen(true);
};

const handleClose = () => {
setOpen(false);
setTaskError('');
setEditCardId(null);
setNewTask({ title: '' }); // Reset the input field when closing the dialog
};

const handleAddCard = () => {
if (!selectedColumnId || !newTask.title.trim()) {
setTaskError('Task name is required.');
return;
}

const newCard = {
id: editCardId || `Card${new Date().getTime()}`,
title: newTask.title || 'New Task',
};

const updatedData = {
...data,
columns: data.columns.map((column) =>
column.id === selectedColumnId
? {
...column,
cards: editCardId
? column.cards.map((card) => (card.id === editCardId ? { ...card, title: newTask.title } : card))
: [...column.cards, newCard],
}
: column
),
};

setData(updatedData);
handleClose();
setNewTask({ title: '' });
setSelectedColumnId(null);
setTaskError('');
};

const MAX_COLUMNS = 5; // Set the maximum number of columns

const handleAddColumn = () => {
if (data.columns.length >= MAX_COLUMNS || !newColumnName.trim()) {
setColumnError('Column name is required.');
return;
}

const newColumn = {
id: `column${new Date().getTime()}`,
title: newColumnName || 'New Column',
cards: [],
};

const updatedData = {
...data,
columns: [...data.columns, newColumn],
};

setData(updatedData);
setAddColumnOpen(false);
setNewColumnName('');
setColumnError('');
};

const handleDragEnd = (result) => {
if (!result.destination) {
return;
}

setData((prevData) => {
const updatedData = { ...prevData };
const sourceColumn = updatedData.columns.find((column) => column.id === result.source.droppableId);
const destinationColumn = updatedData.columns.find((column) => column.id === result.destination.droppableId);

const [movedCard] = sourceColumn.cards.splice(result.source.index, 1);
destinationColumn.cards.splice(result.destination.index, 0, movedCard);

return updatedData;
});
};

const handleMenuOpen = (event, columnId) => {
setMenuAnchor(event.currentTarget);
setSelectedColumnId(columnId);
};

const handleMenuClose = () => {
setMenuAnchor(null);
setSelectedColumnId(null);
};

const handleRenameColumn = () => {
if (!selectedColumnId || !newColumnTitle.trim()) {
return;
}

const updatedData = {
...data,
columns: data.columns.map((column) =>
column.id === selectedColumnId ? { ...column, title: newColumnTitle.trim() } : column
),
};

setData(updatedData);
setRenameColumnOpen(false);
setMenuAnchor(null);
setSelectedColumnId(null);
setNewColumnTitle('');
};

const handleClearTasks = () => {
if (!selectedColumnId) {
return;
}

const updatedData = {
...data,
columns: data.columns.map((column) =>
column.id === selectedColumnId ? { ...column, cards: [] } : column
),
};

setData(updatedData);
setMenuAnchor(null);
setSelectedColumnId(null);
};

const handleDeleteColumn = (columnId) => {
const updatedData = {
...data,
columns: data.columns.filter((column) => column.id !== columnId),
};
setData(updatedData);
setMenuAnchor(null);
setSelectedColumnId(null);
};

const handleDeleteCard = (columnId, cardId) => {
const updatedData = {
...data,
columns: data.columns.map((column) =>
column.id === columnId ? { ...column, cards: column.cards.filter((card) => card.id !== cardId) } : column
),
};

setData(updatedData);
setDeleteCardId(null);
};

return (
<ThemeProvider
theme={createTheme({
palette: {
primary: {
main: '#7c4dff',
},
},
})}
>
<DragDropContext onDragEnd={handleDragEnd}>
<Droppable droppableId="kanban-board" direction="horizontal" type="COLUMN">
{(provided) => (
<div ref={provided.innerRef} {...provided.droppableProps} className="kanban-board">
<Grid container spacing={2}>
{data.columns.map((column, index) => (
<Draggable key={column.id} draggableId={column.id} index={index}>
{(provided) => (
<Grid
key={column.id}
item
xs={2}
ref={provided.innerRef}
{...provided.draggableProps}
{...provided.dragHandleProps}
style={{ flex: '1', maxWidth: '300px', margin: '8px' }}
>
<div className="column-header">
<Card>
<CardHeader
title={column.title}
action={
<>
<IconButton
aria-label="settings"
onClick={(event) => handleMenuOpen(event, column.id)}
>
<MoreHorizIcon />
</IconButton>
<Menu
id="simple-menu"
anchorEl={menuAnchor}
keepMounted
open={Boolean(menuAnchor && selectedColumnId === column.id)}
onClose={handleMenuClose}
>
<MenuItem onClick={() => setRenameColumnOpen(true)}>Rename</MenuItem>
<MenuItem onClick={handleClearTasks}>Clear</MenuItem>
<MenuItem onClick={() => handleDeleteColumn(column.id)}>Delete</MenuItem>
</Menu>
</>
}
/>
<Divider />
<CardContent>
<div className="task-list">
<Droppable droppableId={column.id} type="CARD">
{(provided) => (
<div ref={provided.innerRef} {...provided.droppableProps}>
{column.cards.map((card, cardIndex) => (
<Draggable key={card.id} draggableId={card.id} index={cardIndex}>
{(provided) => (
<Card
key={card.id}
className="task-card"
style={{ marginBottom: '10px' }}
>
<CardContent
ref={provided.innerRef}
{...provided.draggableProps}
{...provided.dragHandleProps}>
<Typography>{card.title}</Typography>
</CardContent>
<CardActions>
<IconButton
aria-label="edit"
onClick={() => handleOpen(column.id, card.id)}
>
<EditIcon />
</IconButton>
<IconButton
aria-label="delete"
onClick={() => setDeleteCardId(card.id)}
>
<DeleteIcon />
</IconButton>
</CardActions>
</Card>
)}
</Draggable>
))}
{provided.placeholder}
</div>
)}
</Droppable>
</div>
</CardContent>
<Divider />
<CardActions>
<div className="MuiBox-root">
<Button
className="MuiButton-root MuiButton-text MuiButton-textPrimary MuiButton-sizeMedium MuiButton-textSizeMedium add-card-button"
onClick={() => handleOpen(column.id)}
style={{ backgroundColor: 'white', textTransform: 'none' }}
>
Add Card
</Button>
</div>
</CardActions>
</Card>
</div>
</Grid>
)}
</Draggable>
))}
<Grid item xs={3}>
<div className="column-header" style={{ flex: '0 0 auto', margin: '8px' }}>
{data.columns.length < MAX_COLUMNS && (
<Button
className="add-column-button "
onClick={() => setAddColumnOpen(true)}
style={{ backgroundColor: 'white', textTransform: 'none' }}
>
Add Column
</Button>
)}
</div>
</Grid>
</Grid>
{provided.placeholder}
</div>
)}
</Droppable>
<Dialog open={open} onClose={handleClose}>
<DialogContent>
<TextField
label="Name"
variant="outlined"
value={newTask.title}
onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
/>
{taskError && <Typography color="error">{taskError}</Typography>}
</DialogContent>
<DialogActions style={{ justifyContent: 'space-between' }}>
<Button onClick={handleClose} color="primary">
Cancel
</Button>
<Button onClick={handleAddCard} color="primary" variant="contained">
{editCardId ? 'Edit' : 'Add'}
</Button>
</DialogActions>
</Dialog>
<Dialog open={addColumnOpen} onClose={() => setAddColumnOpen(false)}>
<DialogContent>
<TextField
label="Name"
variant="outlined"
value={newColumnName}
onChange={(e) => setNewColumnName(e.target.value)}
/>
{columnError && <Typography color="error">{columnError}</Typography>}
</DialogContent>
<DialogActions style={{ justifyContent: 'space-between' }}>
<Button onClick={() => setAddColumnOpen(false)} color="primary">
Cancel
</Button>
<Button onClick={handleAddColumn} color="primary" variant="contained">
Add
</Button>
</DialogActions>
</Dialog>
<Dialog open={renameColumnOpen} onClose={() => setRenameColumnOpen(false)}>
<DialogContent>
<TextField
label="Name"
variant="outlined"
value={newColumnTitle}
onChange={(e) => setNewColumnTitle(e.target.value)}
/>
</DialogContent>
<DialogActions style={{ justifyContent: 'space-between' }}>
<Button onClick={() => setRenameColumnOpen(false)} color="primary">
Cancel
</Button>
<Button onClick={handleRenameColumn} color="primary" variant="contained">
Edit
</Button>
</DialogActions>
</Dialog>
<Dialog open={Boolean(deleteCardId)} onClose={() => setDeleteCardId(null)}>
<DialogContent>
<Typography>Are you sure you want to delete this card?</Typography>
</DialogContent>
<DialogActions style={{ justifyContent: 'space-between' }}>
<Button onClick={() => setDeleteCardId(null)} color="primary">
Cancel
</Button>
<Button
onClick={() => handleDeleteCard(selectedColumnId, deleteCardId)}
color="primary"
variant="contained"
>
Delete
</Button>
</DialogActions>
</Dialog>
</DragDropContext>
</ThemeProvider>
);
};

export default KanbanBoard;