import React, { useEffect, useState, useMemo } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  TextField,
  Paper,
  IconButton,
  Snackbar,
  Alert,
  Pagination,
  List,
  ListItem,
  ListItemText,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  ListItemIcon,
  MenuItem,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import GroupIcon from "@mui/icons-material/Group";
import PersonIcon from "@mui/icons-material/Person";
import { useGroupStore } from "./store/useGroupStore";
import { useUserStore } from "./store/useUserStore";
import { useTaskStore } from "./store/useTaskStore";

const GroupsManagement = () => {
 const { user, loadUserFromStorage } = useUserStore();
const userId = user?.id; // not _id


  const { groups, fetchGroups, createGroup, deleteGroup, joinGroup, leaveGroup, setProject, removeProject } =
    useGroupStore();
  const { projects } = useTaskStore();

  const [newGroup, setNewGroup] = useState("");
  const [search, setSearch] = useState("");
  const [projectInputs, setProjectInputs] = useState({});
  const [page, setPage] = useState(1);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [membersDialog, setMembersDialog] = useState({ open: false, members: [] });

  const itemsPerPage = 5;
useEffect(() => {
  loadUserFromStorage()
    .then(() => fetchGroups())
    .catch(() => openSnackbar("Failed to load user data or groups", "error"));
}, [loadUserFromStorage, fetchGroups]);

  const filteredGroups = useMemo(
    () => groups.filter((g) => g.name.toLowerCase().includes(search.toLowerCase())),
    [groups, search]
  );

  const openSnackbar = (message, severity = "success") =>
    setSnackbar({ open: true, message, severity });

  const handleCreate = async () => {
    if (!newGroup.trim()) return;
    try {
      await createGroup(newGroup.trim());
      openSnackbar("Group created successfully");
      setNewGroup("");
    } catch {
      openSnackbar("Error creating group", "error");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteGroup(id);
      openSnackbar("Group deleted", "info");
    } catch {
      openSnackbar("Error deleting group", "error");
    }
  };

  const handleJoinLeave = async (group, isMember) => {
    try {
      isMember ? await leaveGroup(group._id) : await joinGroup(group._id);
      openSnackbar(isMember ? "Left group" : "Joined group");
    } catch {
      openSnackbar("Action failed", "error");
    }
  };

  const handleSetProject = async (groupId) => {
    const projectId = projectInputs[groupId];
    if (!projectId) return;

    const project = projects.find((p) => p.id === projectId);
    if (!project) return;

    try {
      await setProject(groupId, project.name);
      openSnackbar("Project assigned");
      setProjectInputs((prev) => ({ ...prev, [groupId]: "" }));
    } catch {
      openSnackbar("Failed to assign project", "error");
    }
  };

  const handleRemoveProject = async (groupId) => {
    try {
      await removeProject(groupId);
      openSnackbar("Project removed");
    } catch {
      openSnackbar("Failed to remove project", "error");
    }
  };

  const openMembersDialog = (members) => setMembersDialog({ open: true, members });
  const closeMembersDialog = () => setMembersDialog({ open: false, members: [] });

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>

      
      {/* Top Bar */} 
      
      <AppBar position="static">

        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Groups Management
          </Typography>
          <TextField
            size="small"
            placeholder="Search..."
            variant="outlined"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
      sx={{
        bgcolor: "white",
        borderRadius: 1,
        "& .MuiInputBase-input::placeholder": {
          color: "black",
          opacity: 1,
        },
      }}
    />
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Paper sx={{  p: 2 }}>
        {/* Create Group */}
        <Box display="flex" gap={2} mb={2}>
          <TextField
            label="New Group Name"
            value={newGroup}
            onChange={(e) => setNewGroup(e.target.value)}
            fullWidth
          />
          <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleCreate}>
            Create
          </Button>
        </Box>

        {/* Group List */}
        <List>
          {filteredGroups
            .slice((page - 1) * itemsPerPage, page * itemsPerPage)
            .map((group) => {const isMember = group.members?.some(member => member._id === userId);


  console.log("Group:", group ,  group.name, "isMember:", isMember, "members:", group.members, "userId:", userId);



              const currentProjectName = group.currentProject || "None";

              return (
                <React.Fragment key={group._id}>
                  <ListItem
                    secondaryAction={
                      <Box display="flex" gap={1}>
                        <Button onClick={() => handleJoinLeave(group, isMember)} startIcon={<GroupIcon />} variant="contained" color="primary" size="small">
                          {isMember ? "Leave" : "Join"}
                        </Button>
                        <Button size="small" variant="contained" color="primary" onClick={() => openMembersDialog(group.members)}>
                          Members
                        </Button>
                        <IconButton edge="end" onClick={() => handleDelete(group._id)}>
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    }
                  >
                    <ListItemText
                      primary={group.name}
                      secondary={
                        <Box mt={1} display="flex" flexDirection="column" gap={1}>
                          <Typography variant="body2">Members: {group.members?.length || 0}</Typography>

                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="body2">Project: {currentProjectName}</Typography>

                            <TextField
                              select
                              size="small"
                              value={projectInputs[group._id] || ""}
                              onChange={(e) =>
                                setProjectInputs((prev) => ({ ...prev, [group._id]: e.target.value }))
                              }
                              sx={{ minWidth: 150 }}
                            >
                              <MenuItem value="">-- Select Project --</MenuItem>
                              {projects.map((p) => (
                                <MenuItem key={p.id} value={p.id}>
                                  {p.name}
                                </MenuItem>
                              ))}
                            </TextField>

                            <Button variant="contained" color="primary" size="small" onClick={() => handleSetProject(group._id)}>
                              Assign
                            </Button>

                            {/* Finish Project button */}
                            <Button
                              variant="contained"
                              size="small"
                              color="success"
                              onClick={() => handleRemoveProject(group._id)}
                            >
                              Finish
                            </Button>
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              );
            })}
        </List>

        {/* Pagination */}
        <Pagination
          count={Math.ceil(filteredGroups.length / itemsPerPage)}
          page={page}
          onChange={(e, val) => setPage(val)}
          sx={{ mt: 2 }}
        />
      </Paper>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>

      {/* Members Dialog */}
      <Dialog open={membersDialog.open} onClose={closeMembersDialog}>
        <DialogTitle>Group Members</DialogTitle>
        <DialogContent>
          <List>
            {membersDialog.members.map((m) => (
              <ListItem key={m._id}>
                <ListItemIcon>
                  <PersonIcon />
                </ListItemIcon>
                <ListItemText primary={m.username} />
              </ListItem>
            ))}
          </List>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default GroupsManagement;
