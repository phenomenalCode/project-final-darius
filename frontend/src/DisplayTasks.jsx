import React, { useState, useMemo } from 'react';
import { useTaskStore } from './store/useTaskStore';
import {
  Box,
  Typography,
  Divider,
  Chip,
  Paper,
  Button,
  Checkbox,
  Select,
  MenuItem,
  useTheme,
  FormControl,
  InputLabel,
} from '@mui/material';

export const DisplayTasks = () => {
  const [show, setShow] = useState('all');
  const [sortBy, setSortBy] = useState('created-desc');
  const {
    tasks: rawTasks,
    projects,
    toggleTaskCompletion,
    deleteTask,
    completeAllTasks,
    deleteProject,
  } = useTaskStore();

  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  /* ---------- Filtering ---------- */
  const filteredTasks = useMemo(() => {
    switch (show) {
      case 'completed':
        return rawTasks.filter((t) => t.completed);
      case 'uncompleted':
        return rawTasks.filter((t) => !t.completed);
      default:
        return rawTasks;
    }
  }, [rawTasks, show]);

  /* ---------- Sorting ---------- */
  const tasks = useMemo(() => {
    return [...filteredTasks].sort((a, b) => {
      const compareDates = (d1, d2) => (d1 || '').localeCompare(d2 || '');
      switch (sortBy) {
        case 'due-asc':
          return compareDates(a.dueDate, b.dueDate);
        case 'due-desc':
          return compareDates(b.dueDate, a.dueDate);
        case 'created-asc':
          return a.createdAt.localeCompare(b.createdAt);
        case 'created-desc':
          return b.createdAt.localeCompare(a.createdAt);
        case 'category':
          return (a.category || '').localeCompare(b.category || '');
        default:
          return 0;
      }
    });
  }, [filteredTasks, sortBy]);

  const uncompletedCount = tasks.filter((t) => !t.completed).length;

  /* ---------- Render: Empty State ---------- */
  if (!tasks.length) {
    return (
      <Typography
        sx={{
          color: 'gray',
          mt: 4,
          textAlign: 'center',
          fontSize: { xs: '1rem', sm: '1.2rem', md: '1.3rem' },
        }}
        aria-live="polite"
      >
        No tasks to display.
      </Typography>
    );
  }

  /* ---------- Helpers ---------- */
  const renderDueDate = (task) => {
    if (!task.dueDate) return null;
    const due = new Date(task.dueDate);
    const hoursLeft = (due.getTime() - Date.now()) / 36e5;
    const dueSoon = hoursLeft > 0 && hoursLeft <= 24 && !task.completed;

    return (
      <Typography
        variant="caption"
        sx={{
          mt: 0.2,
          display: 'block',
          fontStyle: 'italic',
          color: dueSoon ? 'error.main' : 'text.secondary',
        }}
      >
        Due: {due.toLocaleDateString()} {due.toLocaleTimeString()}
      </Typography>
    );
  };

  /* ---------- Render ---------- */
  return (
    <Paper
      role="region"
      aria-label="Task list"
      elevation={3}
      sx={{
        p: { xs: 2, sm: 3 },
        mx: 'auto',
        mt: { xs: 2, sm: 4 },
        width: { xs: '100%', sm: '95%', md: '90%', lg: 600 },
        bgcolor: 'background.paper',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
          mb: 2,
          width: '100%',
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 500,
            minWidth: 0,
            overflowWrap: 'break-word',
            textAlign: { xs: 'center', sm: 'left' },
          }}
        >
          Tasks ({tasks.length}) • Uncompleted ({uncompletedCount})
        </Typography>

        {/* Filters */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            flexWrap: 'wrap',
            gap: 1,
            width: '100%',
          }}
        >
          <FormControl
            size="small"
            fullWidth
            sx={{ flex: '1 1 auto', minWidth: { xs: '100%', sm: 140 } }}
          >
            <InputLabel id="filter-tasks-label">Filter</InputLabel>
            <Select
              id="filter-tasks"
              labelId="filter-tasks-label"
              label="Filter"
              fullWidth
              value={show}
              onChange={(e) => setShow(e.target.value)}
              sx={{
                '& .MuiSelect-select': {
                  display: 'block',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                },
              }}
            >
              <MenuItem value="all" title="All">All</MenuItem>
              <MenuItem value="completed" title="Completed">Completed</MenuItem>
              <MenuItem value="uncompleted" title="Uncompleted">Uncompleted</MenuItem>
            </Select>
          </FormControl>

          <FormControl
            size="small"
            fullWidth
            sx={{ flex: '1 1 auto', minWidth: { xs: '100%', sm: 160 } }}
          >
            <InputLabel id="sort-tasks-label">Sort by</InputLabel>
            <Select
              id="sort-tasks"
              labelId="sort-tasks-label"
              label="Sort by"
              fullWidth
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              sx={{
                '& .MuiSelect-select': {
                  display: 'block',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                },
              }}
            >
              <MenuItem value="created-desc" title="Newest First">Newest First</MenuItem>
              <MenuItem value="created-asc" title="Oldest First">Oldest First</MenuItem>
              <MenuItem value="due-asc" title="Due Soonest">Due Soonest</MenuItem>
              <MenuItem value="due-desc" title="Due Latest">Due Latest</MenuItem>
              <MenuItem value="category" title="Category A→Z">Category A→Z</MenuItem>
            </Select>
          </FormControl>

          <Button
            size="small"
            variant="contained"
            onClick={completeAllTasks}
            aria-label="Mark all tasks as complete"
          >
            Complete All
          </Button>
        </Box>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Task List */}
      <ul aria-label="Task list" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {tasks.map((task) => {
          const project = projects.find((p) => p.id === task.projectId);
          const overdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;
          const statusLabel = overdue ? 'Overdue' : task.completed ? 'Completed' : 'Incomplete';
          const statusKind = overdue ? 'error' : task.completed ? 'success' : 'warning';

          return (
            <li key={task.id} style={{ marginBottom: '1rem' }}>
              <Box
                sx={{
                  p: { xs: 1.5, sm: 2 },
                  border: `1px solid ${isDarkMode ? theme.palette.divider : '#ccc'}`,
                  borderRadius: 2,
                  bgcolor: 'background.default',
                  overflowWrap: 'break-word',
                }}
              >
                {/* Task Row */}
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    justifyContent: 'space-between',
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    gap: 1,
                    flexWrap: 'wrap',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                    <Checkbox
                      checked={task.completed}
                      onChange={() => toggleTaskCompletion(task.id)}
                      inputProps={{ 'aria-labelledby': `task-label-${task.id}` }}
                    />
                    <Typography
                      id={`task-label-${task.id}`}
                      sx={{
                        textDecoration: task.completed ? 'line-through' : 'none',
                        wordBreak: 'break-word',
                      }}
                    >
                      {task.title || task.task || 'Untitled Task'}
                    </Typography>
                  </Box>

                  <Button size="small" color="error" onClick={() => deleteTask(task.id)}>
                    Delete
                  </Button>
                </Box>

                {/* Status */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                  <Typography variant="body2"><strong>Status:</strong></Typography>
                  {statusKind === 'warning' ? (
                    <Chip
                      label={statusLabel}
                      size="small"
                      variant="filled"
                      sx={{
                        bgcolor: '#bf360c',
                        color: '#ffffff',
                        fontWeight: 600,
                        '& .MuiChip-label': { color: '#ffffff', fontWeight: 600 },
                      }}
                    />
                  ) : (
                    <Chip
                      label={statusLabel}
                      size="small"
                      color={statusKind}
                      sx={{ fontWeight: 600 }}
                    />
                  )}
                </Box>

                {/* Category */}
                <Typography variant="body2">
                  <strong>Category:</strong> {task.category || 'None'}
                </Typography>

                {/* Project */}
                <Typography variant="body2" sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  <strong>Project:</strong>
                  {project ? `${project.name} (${project.completed ? 'Done' : 'Ongoing'})` : 'None'}
                  {project && (
                    <Button
                      size="small"
                      color="error"
                      onClick={() => deleteProject(project.id)}
                      sx={{ minWidth: 0, px: 0.5 }}
                    >
                      ✕
                    </Button>
                  )}
                </Typography>

                {/* Dates */}
                <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                  Created: {new Date(task.createdAt).toLocaleString()}
                </Typography>

                {renderDueDate(task)}
{/* Files */}
{/* Files */}
{task.files?.length > 0 && (
  <Box sx={{ mt: 1 }}>
    <Typography variant="body2">
      <strong>Files:</strong>
    </Typography>
    <ul aria-label="Attached files" style={{ margin: 0, paddingLeft: '1.2rem' }}>
      {task.files.map((file, idx) => {
        const fileName = file.name || 'Unknown';
        const fileSizeKB = file.size ? Math.round(file.size / 1024) : null;
        const handleViewFile = async (file) => {
          console.log("[File] File object:", file);
         const fileUrl = file.url || file.path;
 if (!fileUrl) return alert("File URL not available");

          try {
            const token = localStorage.getItem("token");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            const fetchUrl = fileUrl.startsWith("/")
              ? `http://localhost:8080${fileUrl}`
              : file.url;

            console.log("[File] Fetching:", fetchUrl, "with headers:", headers);

            const res = await fetch(fetchUrl, { headers });
            
    console.log("[File] Response status:", res.status, res.statusText);
    console.log("[File] Response headers:", Object.fromEntries(res.headers.entries()));
            if (!res.ok) throw new Error(`Failed to fetch file: ${res.status} ${res.statusText}`);

            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const newWin = window.open(url, "_blank");
            if (!newWin) alert("Popup blocked! Please allow popups to view the file.");
          } catch (err) {
            console.error("[File] Error fetching file:", err);
            alert(err.message);
          }
        };

        return (
          <li key={idx} style={{ wordBreak: 'break-word' }}>
            <Button
              size="small"
              variant="text"
              onClick={() => handleViewFile(file)}
              sx={{ textDecoration: 'underline', color: '#1976d2', padding: 0, minWidth: 0 }}
            >
              {fileName} {fileSizeKB ? `(${fileSizeKB} KB)` : ''}
            </Button>
          </li>
        );
      })}
    </ul>
  </Box>
)}



              </Box>
            </li>
          );
        })}
      </ul>
    </Paper>
  );
};

//Fixed warning Chip contrast for dark mode by using a darker orange background and white text to meet WCAG standards.

// Added responsive text wrapping and ellipsis for Filter and Sort dropdowns to prevent overflow.

// Updated header typography to wrap on small screens and prevent overflow (minWidth: 0, overflowWrap: 'break-word').

// Highlighted due-soon tasks using theme’s error.main color instead of inline red.

// Added accessibility improvements: aria-labelledby on checkboxes, role="region" and aria-label for task list.

// Ensured layout is responsive and compatible with both dark and light modes.