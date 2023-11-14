import  { useState, useEffect } from 'react';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
import {
  Button,
  Card,
  CardActions,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  Grid,
  Typography,
  TextField,
  IconButton,
  CardHeader,
  Menu,
  MenuItem,
} from '@material-ui/core';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const KanbanBoard = () => {
  const [data, setData] = useState({
    lanes: [],
  });
  const [open, setOpen] = useState(false);
  const [addColumnOpen, setAddColumnOpen] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');
  const [newTask, setNewTask] = useState({ title: '', description: '' });
  const [selectedLaneId, setSelectedLaneId] = useState(null);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [renameColumnOpen, setRenameColumnOpen] = useState(false);
  const [deleteColumnOpen, setDeleteColumnOpen] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');

  useEffect(() => {
    // Save data to backend or perform other actions when data changes
    // For simplicity, this is an empty useEffect. You can add your logic here.
  }, [data]);

  const handleOpen = (laneId) => {
    setSelectedLaneId(laneId);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleAddCard = () => {
    if (!selectedLaneId) {
      return; // Do nothing if no lane is selected
    }

    const newCard = {
      id: `Card${new Date().getTime()}`,
      title: newTask.title || 'New Task',
      description: newTask.description || 'Description for New Task',
    };

    const updatedData = {
      ...data,
      lanes: data.lanes.map((lane) =>
        lane.id === selectedLaneId ? { ...lane, cards: [...lane.cards, newCard] } : lane
      ),
    };

    setData(updatedData);
    handleClose();
    setNewTask({ title: '', description: '' });
    setSelectedLaneId(null); // Reset selected lane after adding the card
  };

  const MAX_COLUMNS = 5; // Set the maximum number of columns

  const handleAddColumn = () => {
    if (data.lanes.length >= MAX_COLUMNS) {
      alert('You can only create 5 columns.');
      return;
    }

    const newColumn = {
      id: `lane${new Date().getTime()}`,
      title: newColumnName || 'New Column',
      cards: [],
    };

    const updatedData = {
      ...data,
      lanes: [...data.lanes, newColumn],
    };

    setData(updatedData);
    setAddColumnOpen(false);
    setNewColumnName('');
  };

  const handleDragEnd = (result) => {
    if (!result.destination) {
      return;
    }

    const updatedData = { ...data };
    const sourceLane = updatedData.lanes.find((lane) => lane.id === result.source.droppableId);
    const destinationLane = updatedData.lanes.find(
      (lane) => lane.id === result.destination.droppableId
    );

    const [movedCard] = sourceLane.cards.splice(result.source.index, 1);
    destinationLane.cards.splice(result.destination.index, 0, movedCard);

    setData(updatedData);
  };

  const handleMenuOpen = (event, laneId) => {
    setMenuAnchor(event.currentTarget);
    setSelectedLaneId(laneId);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedLaneId(null);
  };

  const handleRenameColumn = () => {
    if (!selectedLaneId || !newColumnTitle.trim()) {
      return;
    }

    const updatedData = {
      ...data,
      lanes: data.lanes.map((lane) =>
        lane.id === selectedLaneId ? { ...lane, title: newColumnTitle.trim() } : lane
      ),
    };

    setData(updatedData);
    setRenameColumnOpen(false);
    setMenuAnchor(null);
    setSelectedLaneId(null);
    setNewColumnTitle('');
  };

  const handleClearTasks = () => {
    if (!selectedLaneId) {
      return;
    }

    const updatedData = {
      ...data,
      lanes: data.lanes.map((lane) =>
        lane.id === selectedLaneId ? { ...lane, cards: [] } : lane
      ),
    };

    setData(updatedData);
    setMenuAnchor(null);
    setSelectedLaneId(null);
  };

  const handleDeleteColumn = () => {
    if (!selectedLaneId) {
      return;
    }

    const updatedData = {
      ...data,
      lanes: data.lanes.filter((lane) => lane.id !== selectedLaneId),
    };

    setData(updatedData);
    setDeleteColumnOpen(false);
    setMenuAnchor(null);
    setSelectedLaneId(null);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="kanban-board" direction="horizontal" type="COLUMN">
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps} className="kanban-board">
            <Grid container spacing={2} style={{ justifyContent: 'flex-start' }}>
              {data.lanes.map((lane, index) => (
                <Draggable key={lane.id} draggableId={lane.id} index={index}>
                  {(provided) => (
                    <Grid
                      key={lane.id}
                      item
                      xs={2}
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <div className="column-header">
                        <Card>
                          <CardHeader
                            title={lane.title}
                            action={
                              <>
                                <IconButton
                                  aria-label="settings"
                                  onClick={(event) => handleMenuOpen(event, lane.id)}
                                >
                                  <MoreHorizIcon />
                                </IconButton>
                                <Menu
                                  id="simple-menu"
                                  anchorEl={menuAnchor}
                                  keepMounted
                                  open={Boolean(menuAnchor && selectedLaneId === lane.id)}
                                  onClose={handleMenuClose}
                                >
                                  <MenuItem onClick={() => setRenameColumnOpen(true)}>Rename</MenuItem>
                                  <MenuItem onClick={handleClearTasks}>Clear</MenuItem>
                                  <MenuItem onClick={() => setDeleteColumnOpen(true)}>Delete</MenuItem>
                                </Menu>
                              </>
                            }
                          />
                          <Divider />
                          <CardContent>
                            <div className="task-list">
                              <Droppable droppableId={lane.id} type="CARD">
                                {(provided) => (
                                  <div ref={provided.innerRef} {...provided.droppableProps}>
                                    {lane.cards.map((card, index) => (
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
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                          >
                                            <CardContent>
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
                                className="MuiButton-root MuiButton-text MuiButton-textPrimary MuiButton-sizeMedium MuiButton-textSizeMedium"
                                onClick={() => handleOpen(lane.id)}
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
              <Grid item xs={3} style={{ textAlign: 'center' }}>
                <div className="column-header">
                  {data.lanes.length < MAX_COLUMNS && (
                    <Button
                      className="add-column-button MuiButton-root MuiButton-text MuiButton-textPrimary MuiButton-sizeLarge MuiButton-textSizeLarge"
                      onClick={() => setAddColumnOpen(true)}
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
            label="Title"
            variant="outlined"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
          />
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
            label="New Title"
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
            Rename
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={deleteColumnOpen} onClose={() => setDeleteColumnOpen(false)}>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the column? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions style={{ justifyContent: 'space-between' }}>
          <Button onClick={() => setDeleteColumnOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteColumn} color="primary" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </DragDropContext>
  );
};

export default KanbanBoard;