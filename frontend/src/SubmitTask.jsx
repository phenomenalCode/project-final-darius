import React, { useState, useCallback } from 'react';
import { useTaskStore } from './store/useTaskStore';
import { useUserStore } from './store/useUserStore';
import {
  Box,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  useTheme,
  Stack,
  Typography
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

export const SubmitTask = () => {
  const theme = useTheme();
  const { addTask, projects, addProject } = useTaskStore();

  // ---------------- Form State ----------------
  const [input, setInput] = useState('');
  const [category, setCategory] = useState('');
  const [projectId, setProjectId] = useState('');
  const [dueDate, setDueDate] = useState(null);
  const [newProject, setNewProject] = useState('');
  const [fileObjects, setFileObjects] = useState([]);
  const [folders, setFolders] = useState([]);

  // ---------------- Handlers ----------------
  const handleAddProject = useCallback(() => {
    const name = newProject.trim();
    if (!name) return;
    const id = Date.now();
    addProject({ id, name, completed: false });
    setProjectId(id);
    setNewProject('');
  }, [newProject, addProject]);

  // File input handler - only updates fileObjects and folders
  const handleFileInput = useCallback((e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setFileObjects(prev => [...prev, ...files]);
    const uniqueFolders = files.map(f => f.webkitRelativePath ? f.webkitRelativePath.split('/')[0] : 'root');
    setFolders(prev => [...new Set([...prev, ...uniqueFolders])]);

    // Reset input value so same file can be picked again
    e.target.value = null;
  }, []);

const handleSubmit = useCallback(async (e) => {
  e.preventDefault();
  if (!input.trim()) return alert('Please enter a task');

  try {
    const token = useUserStore.getState().token || localStorage.getItem("token");
    const formData = new FormData();
    formData.append('task', input.trim());
    formData.append('category', category);
    // Don't send group — backend will set it from req.user.groupId
    if (dueDate) formData.append('dueDate', dueDate.toISOString());

    fileObjects.forEach(file => {
      console.log("Appending file to FormData:", file.name, file.size, file.type);
      formData.append('files', file, file.name);
    });

    // Debug FormData
    console.log("FormData contents:");
    for (const [key, value] of formData.entries()) {
      console.log(key, value instanceof File ? `${value.name} (${value.size} bytes)` : value);
    }

    const res = await fetch('http://localhost:8080/tasks', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    const backendTask = await res.json();
    console.log("Backend response:", backendTask);

    if (backendTask.error) return alert(`Error: ${backendTask.error}`);

    addTask({
      id: backendTask._id || Date.now(),
      title: backendTask.title || input.trim(),
      category: backendTask.category || category,
      projectId: projectId || null, // UI only
      files: backendTask.files?.map(f => ({
        name: f.name,
        path: f.url,
        type: f.contentType,
        size: f.size
      })) || [],
      folders: backendTask.folders || folders,
      completed: backendTask.completed ?? false,
      createdAt: backendTask.createdAt || new Date().toISOString(),
      dueDate: backendTask.dueDate ? new Date(backendTask.dueDate) : dueDate,
    });

    // Reset form
    setInput('');
    setCategory('');
    setProjectId('');
    setDueDate(null);
    setFileObjects([]);
    setFolders([]);
    setNewProject('');

  } catch (err) {
    console.error("Error submitting task:", err);
    alert(err.message);
  }
}, [input, category, projectId, dueDate, fileObjects, folders, addTask]);


  // ---------------- UI ----------------
  return (
    <Box
      role="form"
      aria-label="Task submission form"
      sx={{
        p: { xs: 2, sm: 3, md: 4 },
        width: '100%',
        maxWidth: { xs: '100%', sm: 500 },
        mx: 'auto',
        bgcolor: theme.palette.mode === 'dark' ? theme.palette.background.default : '#eeeeee',
        color: theme.palette.text.primary,
        borderRadius: 2,
        boxShadow: 4
      }}
    >
      <Typography component="h2" variant="h4" gutterBottom sx={{ textAlign: 'center' }}>
        To Do List
      </Typography>

      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <TextField
            label="Enter Task"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            fullWidth
            required
            inputProps={{ 'aria-label': 'Task name input' }}
          />

          <FormControl fullWidth>
            <InputLabel id="category-label">Category</InputLabel>
            <Select
              labelId="category-label"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              label="Category"
              inputProps={{ 'aria-label': 'Select task category' }}
            >
              {['Work', 'Home', 'Health', 'Errands', 'Leisure', 'Other'].map(c => (
                <MenuItem key={c} value={c}>{c}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel id="project-label">Project</InputLabel>
            <Select
              labelId="project-label"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              label="Project"
              inputProps={{ 'aria-label': 'Select project for task' }}
            >
              <MenuItem value="">None</MenuItem>
              {projects.map(p => (
                <MenuItem key={p.id} value={p.id}>
                  {p.name} {p.completed ? '✅' : ''}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <TextField
              label="New Project"
              value={newProject}
              onChange={(e) => setNewProject(e.target.value)}
              size="small"
              fullWidth
              inputProps={{ 'aria-label': 'New project name input' }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddProject}
              aria-label="Add new project"
              sx={{ width: { xs: '100%', sm: 'auto' } }}
            >
              Add
            </Button>
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <Button variant="contained" color="primary"  component="label" fullWidth aria-label="Upload files">
              Upload Files
              <input
                type="file"
                hidden
                multiple
                onChange={handleFileInput} // reset inside handler
              />
            </Button>

            <Button variant="contained" color="primary" component="label" fullWidth aria-label="Upload folder">
              Upload Folder
              <input
                type="file"
                hidden
                webkitdirectory="true"
                onChange={handleFileInput} // reset inside handler
              />
            </Button>
          </Stack>

          {fileObjects.length > 0 && (
            <Box>
              <Typography variant="subtitle2">Files to Upload:</Typography>
              <ul>
                {fileObjects.map((f, i) => <li key={i}>{f.name}</li>)}
              </ul>
            </Box>
          )}

          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Due Date"
              value={dueDate}
              onChange={(newVal) => setDueDate(newVal)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  inputProps: { 'aria-label': 'Select due date for task' },
                  sx: { '& .MuiSvgIcon-root': { color: theme.palette.mode === 'dark' ? theme.palette.primary.main : 'inherit' } }
                }
              }}
            />
          </LocalizationProvider>

          <Button type="submit" variant="contained" size="large" fullWidth aria-label="Submit new task">
            Add Task
          </Button>
        </Stack>
      </form>
    </Box>
  );
};
