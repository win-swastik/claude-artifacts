import React, { useState, useMemo } from 'react';

// Sample data mimicking Notion task database structure
const sampleNotionData = {
  database: {
    id: "abc123-notion-db",
    title: "Project Tasks",
    properties: {
      title: { type: "title", name: "Task Name" },
      status: { type: "status", name: "Status" },
      project: { type: "select", name: "Project" },
      assignee: { type: "people", name: "Assignee" },
      dueDate: { type: "date", name: "Due Date" },
      priority: { type: "select", name: "Priority" }
    }
  },
  tasks: [
    // Project: Website Redesign
    { id: "1", title: "Create wireframes", status: "Done", project: "Website Redesign", assignee: "Swastik", priority: "High" },
    { id: "2", title: "Design homepage mockup", status: "Done", project: "Website Redesign", assignee: "Swastik", priority: "High" },
    { id: "3", title: "Build responsive header", status: "Done", project: "Website Redesign", assignee: "Dev Team", priority: "Medium" },
    { id: "4", title: "Implement contact form", status: "In Progress", project: "Website Redesign", assignee: "Dev Team", priority: "Medium" },
    { id: "5", title: "Add animations", status: "Not Started", project: "Website Redesign", assignee: "Swastik", priority: "Low" },
    { id: "6", title: "SEO optimization", status: "Not Started", project: "Website Redesign", assignee: "Swastik", priority: "High" },

    // Project: Mobile App
    { id: "7", title: "Setup React Native project", status: "Done", project: "Mobile App", assignee: "Dev Team", priority: "High" },
    { id: "8", title: "Design app navigation", status: "Done", project: "Mobile App", assignee: "Swastik", priority: "High" },
    { id: "9", title: "Build login screen", status: "Done", project: "Mobile App", assignee: "Dev Team", priority: "High" },
    { id: "10", title: "Implement push notifications", status: "In Progress", project: "Mobile App", assignee: "Dev Team", priority: "Medium" },
    { id: "11", title: "Build dashboard view", status: "In Progress", project: "Mobile App", assignee: "Dev Team", priority: "Medium" },
    { id: "12", title: "Add offline support", status: "Not Started", project: "Mobile App", assignee: "Dev Team", priority: "Low" },
    { id: "13", title: "App store submission", status: "Not Started", project: "Mobile App", assignee: "Swastik", priority: "High" },

    // Project: API Integration
    { id: "14", title: "Document API endpoints", status: "Done", project: "API Integration", assignee: "Dev Team", priority: "High" },
    { id: "15", title: "Setup authentication", status: "Done", project: "API Integration", assignee: "Dev Team", priority: "High" },
    { id: "16", title: "Build data sync module", status: "Done", project: "API Integration", assignee: "Dev Team", priority: "High" },
    { id: "17", title: "Error handling & logging", status: "Done", project: "API Integration", assignee: "Dev Team", priority: "Medium" },
    { id: "18", title: "Rate limiting implementation", status: "In Progress", project: "API Integration", assignee: "Dev Team", priority: "Medium" },

    // Project: Marketing
    { id: "19", title: "Create launch campaign", status: "Not Started", project: "Marketing", assignee: "Swastik", priority: "High" },
    { id: "20", title: "Design social media assets", status: "Not Started", project: "Marketing", assignee: "Swastik", priority: "Medium" },
  ]
};

// Status configuration - maps Notion statuses to completion state
const STATUS_CONFIG = {
  "Done": { completed: true, color: "#10b981", bgColor: "#d1fae5" },
  "In Progress": { completed: false, color: "#f59e0b", bgColor: "#fef3c7" },
  "Not Started": { completed: false, color: "#6b7280", bgColor: "#f3f4f6" }
};

// Circular Progress Ring Component
const ProgressRing = ({ percentage, size = 160, strokeWidth = 12, color = "#6366f1" }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.5s ease-in-out" }}
        />
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-gray-800">{Math.round(percentage)}%</span>
        <span className="text-sm text-gray-500">Complete</span>
      </div>
    </div>
  );
};

// Progress Bar Component
const ProgressBar = ({ percentage, label, completed, total, color = "#6366f1" }) => (
  <div className="w-full">
    <div className="flex justify-between items-center mb-2">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <span className="text-sm text-gray-500">{completed}/{total} tasks</span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-500 ease-out"
        style={{ width: `${percentage}%`, backgroundColor: color }}
      />
    </div>
  </div>
);

// Stats Card Component
const StatsCard = ({ title, value, subtitle, icon, color = "#6366f1" }) => (
  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      </div>
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg"
        style={{ backgroundColor: color }}
      >
        {icon}
      </div>
    </div>
  </div>
);

// Task List Item
const TaskItem = ({ task }) => {
  const config = STATUS_CONFIG[task.status] || STATUS_CONFIG["Not Started"];

  return (
    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
      <div
        className="w-3 h-3 rounded-full flex-shrink-0"
        style={{ backgroundColor: config.color }}
      />
      <span className={`flex-1 text-sm ${config.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
        {task.title}
      </span>
      <span
        className="text-xs px-2 py-1 rounded-full font-medium"
        style={{ backgroundColor: config.bgColor, color: config.color }}
      >
        {task.status}
      </span>
    </div>
  );
};

// Main Dashboard Component
export default function NotionTaskProgress() {
  const [selectedProject, setSelectedProject] = useState("All");
  const [viewMode, setViewMode] = useState("overview");

  // Calculate statistics
  const stats = useMemo(() => {
    const tasks = sampleNotionData.tasks;
    const projects = [...new Set(tasks.map(t => t.project))];

    const calculateProgress = (taskList) => {
      const total = taskList.length;
      const completed = taskList.filter(t => STATUS_CONFIG[t.status]?.completed).length;
      const inProgress = taskList.filter(t => t.status === "In Progress").length;
      const notStarted = taskList.filter(t => t.status === "Not Started").length;
      const percentage = total > 0 ? (completed / total) * 100 : 0;
      return { total, completed, inProgress, notStarted, percentage };
    };

    const overall = calculateProgress(tasks);

    const byProject = projects.map(project => ({
      name: project,
      ...calculateProgress(tasks.filter(t => t.project === project))
    }));

    const filteredTasks = selectedProject === "All"
      ? tasks
      : tasks.filter(t => t.project === selectedProject);

    return { overall, byProject, projects, filteredTasks, filtered: calculateProgress(filteredTasks) };
  }, [selectedProject]);

  // Color palette for projects
  const projectColors = {
    "Website Redesign": "#6366f1",
    "Mobile App": "#8b5cf6",
    "API Integration": "#10b981",
    "Marketing": "#f59e0b"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white text-xl">N</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Task Progress Dashboard</h1>
              <p className="text-gray-500 text-sm">Connected to: {sampleNotionData.database.title}</p>
            </div>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex gap-2 mb-6">
          {["overview", "by-project", "task-list"].map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === mode
                  ? 'bg-gray-800 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {mode === "overview" ? "Overview" : mode === "by-project" ? "By Project" : "Task List"}
            </button>
          ))}
        </div>

        {/* Overview Mode */}
        {viewMode === "overview" && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatsCard title="Total Tasks" value={stats.overall.total} icon="📋" color="#6366f1" />
              <StatsCard title="Completed" value={stats.overall.completed} subtitle={`${Math.round(stats.overall.percentage)}% done`} icon="✓" color="#10b981" />
              <StatsCard title="In Progress" value={stats.overall.inProgress} icon="⏳" color="#f59e0b" />
              <StatsCard title="Not Started" value={stats.overall.notStarted} icon="○" color="#6b7280" />
            </div>

            {/* Main Progress Display */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <ProgressRing percentage={stats.overall.percentage} size={180} />
                <div className="flex-1 w-full space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Progress by Project</h3>
                  {stats.byProject.map(project => (
                    <ProgressBar
                      key={project.name}
                      label={project.name}
                      percentage={project.percentage}
                      completed={project.completed}
                      total={project.total}
                      color={projectColors[project.name] || "#6366f1"}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* By Project Mode */}
        {viewMode === "by-project" && (
          <div className="grid md:grid-cols-2 gap-6">
            {stats.byProject.map(project => (
              <div key={project.name} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">{project.name}</h3>
                  <span
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: projectColors[project.name] }}
                  />
                </div>
                <div className="flex items-center gap-6">
                  <ProgressRing
                    percentage={project.percentage}
                    size={100}
                    strokeWidth={8}
                    color={projectColors[project.name]}
                  />
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Completed</span>
                      <span className="font-medium text-green-600">{project.completed}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">In Progress</span>
                      <span className="font-medium text-amber-600">{project.inProgress}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Not Started</span>
                      <span className="font-medium text-gray-600">{project.notStarted}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Task List Mode */}
        {viewMode === "task-list" && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            {/* Project Filter */}
            <div className="flex items-center gap-2 mb-6 flex-wrap">
              <span className="text-sm text-gray-500">Filter:</span>
              {["All", ...stats.projects].map(project => (
                <button
                  key={project}
                  onClick={() => setSelectedProject(project)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    selectedProject === project
                      ? 'bg-gray-800 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {project}
                </button>
              ))}
            </div>

            {/* Progress Summary */}
            <div className="mb-6">
              <ProgressBar
                label={selectedProject === "All" ? "All Projects" : selectedProject}
                percentage={stats.filtered.percentage}
                completed={stats.filtered.completed}
                total={stats.filtered.total}
                color={projectColors[selectedProject] || "#6366f1"}
              />
            </div>

            {/* Task List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {stats.filteredTasks.map(task => (
                <TaskItem key={task.id} task={task} />
              ))}
            </div>
          </div>
        )}

        {/* Footer - Integration Guide */}
        <div className="mt-8 bg-gray-800 text-white rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-3">🔗 Connect to Your Notion Database</h3>
          <p className="text-gray-300 text-sm mb-4">
            This prototype uses sample data. To connect to your real Notion database:
          </p>
          <ol className="text-gray-300 text-sm space-y-2 list-decimal list-inside">
            <li>Share your Notion database with Claude via the Notion connector</li>
            <li>Provide the database URL or search for it by name</li>
            <li>Specify which status values indicate "completed" tasks</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
