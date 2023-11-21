import { useState, useEffect } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles'; 
import { Dialog, DialogActions, DialogContent } from '@mui/material';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import {
  Button,
  Card,
  CardActions,
  CardContent,
  Divider,
  Grid,
  Typography,
  TextField,
  IconButton,
  CardHeader,
  Menu,
  MenuItem,
} from '@mui/material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';


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

  useEffect(() => {
    // Save data to backend or perform other actions when data changes
    // For simplicity, this is an empty useEffect. You can add your logic here.
  }, [data]);

  const handleOpen = (columnId) => {
    setSelectedColumnId(columnId);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setTaskError(null);
  };

  const handleAddCard = () => {
    if (!selectedColumnId || !newTask.title.trim()) {
      setTaskError('Task name is required.');
      return;
    }

    const newCard = {
      id: `Card${new Date().getTime()}`,
      title: newTask.title || 'New Task',
    };

    const updatedData = {
      ...data,
      columns: data.columns.map((column) =>
        column.id === selectedColumnId ? { ...column, cards: [...column.cards, newCard] } : column
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

    const updatedData = { ...data };
    const sourceColumn = updatedData.columns.find((column) => column.id === result.source.droppableId);
    const destinationColumn = updatedData.columns.find(
      (column) => column.id === result.destination.droppableId
    );

    const [movedCard] = sourceColumn.cards.splice(result.source.index, 1);
    destinationColumn.cards.splice(result.destination.index, 0, movedCard);

    setData(updatedData);
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

  return (
    <ThemeProvider theme={createTheme({
      palette: {
        primary: {
          main: '#7c4dff', // Set your primary color here
        },
      },
    })}>
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="kanban-board" direction="horizontal" type="COLUMN">
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps} className="kanban-board">
            <Grid container spacing={2} >
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
                                    {column.cards.map((card, index) => (
                                      <Draggable
                                        key={card.id}
                                        draggableId={card.id}
                                        index={index}
                                      >
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
                                style={{ backgroundColor: 'white', textTransform: 'none'  }}
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
              <Grid item xs={3} >
                <div className="column-header">
                  {data.columns.length < MAX_COLUMNS && (
                    <Button
                      className="add-column-button "
                      onClick={() => setAddColumnOpen(true)}
                      style={{ backgroundColor: 'white', textTransform: 'none'  }}
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
      <Dialog open={open} onClose={handleClose} >
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
            Add
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
    </DragDropContext>
    </ThemeProvider>
  );
};

export default KanbanBoard;