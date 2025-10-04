import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

interface Task {
  id: string;
  title: string;
  status: string;
  columnId: string;
}

interface Column {
  id: string;
  title: string;
  boardId: string;
  tasks: Task[];
}

interface Board {
  id: string;
  name: string;
  ownerId: string;
  columns: Column[];
}

interface User {
  id: string;
  email: string;
  name: string;
}

export default function Board() {
  const [user, setUser] = useState<User | null>(null);
  const [boards, setBoards] = useState<Board[]>([]);
  const [currentBoard, setCurrentBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // Per-column task input values
  const [newTaskTitlesByColumn, setNewTaskTitlesByColumn] = useState<Record<string, string>>({});
  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [showAddColumn, setShowAddColumn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    // Set token in axios headers
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    // Load user info and boards
    Promise.all([
      api.get("/users/me"),
      api.get("/boards")
    ])
      .then(([userRes, boardsRes]) => {
        const me: User = userRes.data;
        const allBoards: Board[] = boardsRes.data || [];
        const myBoards = allBoards.filter(b => b.ownerId === me.id);

        setUser(me);
        setBoards(myBoards);
        if (myBoards.length > 0) {
          setCurrentBoard(myBoards[0]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load data");
        setLoading(false);
      });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const createBoard = async () => {
    if (!user) return;
    
    try {
      const response = await api.post("/boards", {
        name: "My Board",
        ownerId: user.id
      });
      // Ensure the created board has a columns array to avoid runtime errors
      const created = { ...response.data, columns: response.data.columns ?? [] } as Board;
      setBoards([...boards, created]);
      setCurrentBoard(created);
    } catch (err) {
      console.error(err);
      setError("Failed to create board");
    }
  };

  const createColumn = async () => {
    if (!currentBoard || !newColumnTitle.trim()) return;
    
    try {
      const response = await api.post(`/boards/${currentBoard.id}/columns`, {
        title: newColumnTitle
      });
      
      // Ensure currentBoard.columns exists
      const cols = currentBoard.columns ?? [];
      const newCol = { ...response.data, tasks: [] as Task[] };
      const updatedBoard = {
        ...currentBoard,
        columns: [...cols, newCol]
      };
      setCurrentBoard(updatedBoard);
      setNewColumnTitle("");
      setShowAddColumn(false);
    } catch (err) {
      console.error(err);
      setError("Failed to create column");
    }
  };

  const createTask = async (columnId: string) => {
    const titleForColumn = newTaskTitlesByColumn[columnId]?.trim() || "";
    if (!titleForColumn) return;
    
    try {
      const response = await api.post(`/boards/${currentBoard?.id}/columns/${columnId}/tasks`, {
        title: titleForColumn,
        status: "todo"
      });
      
      const updatedBoard = {
        ...currentBoard!,
        columns: currentBoard!.columns.map(col => 
          col.id === columnId 
            ? { ...col, tasks: [...col.tasks, response.data] }
            : col
        )
      };
      setCurrentBoard(updatedBoard);
      setNewTaskTitlesByColumn(prev => ({ ...prev, [columnId]: "" }));
    } catch (err) {
      console.error(err);
      setError("Failed to create task");
    }
  };


  const deleteTask = async (taskId: string) => {
    try {
      await api.delete(`/boards/tasks/${taskId}`);
      
      const updatedBoard = {
        ...currentBoard!,
        columns: currentBoard!.columns.map(col => ({
          ...col,
          tasks: col.tasks.filter(task => task.id !== taskId)
        }))
      };
      setCurrentBoard(updatedBoard);
    } catch (err) {
      console.error(err);
      setError("Failed to delete task");
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 20, textAlign: "center" }}>
        <h2>Loading...</h2>
      </div>
    );
  }

  if (error) {
  return (
    <div style={{ padding: 20 }}>
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: "100vh", 
      background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
      fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, sans-serif",
      position: "relative",
      overflow: "hidden"
    }}>
  {/* Decorative background elements (visual only) */}
      <div style={{
        position: "absolute",
        top: "5%",
        right: "5%",
        width: 40,
        height: 40,
        background: "linear-gradient(135deg, #ff6b9d 0%, #c44569 100%)",
        borderRadius: "50%",
        opacity: 0.2,
        animation: "bounce 4s infinite"
      }}></div>
      <div style={{
        position: "absolute",
        top: "15%",
        left: "3%",
        width: 25,
        height: 25,
        background: "linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)",
        borderRadius: "50%",
        opacity: 0.3,
        animation: "pulse 3s infinite"
      }}></div>
      <div style={{
        position: "absolute",
        bottom: "10%",
        right: "10%",
        width: 35,
        height: 35,
        background: "linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%)",
        borderRadius: "50%",
        opacity: 0.25,
        animation: "wiggle 5s infinite"
      }}></div>

      {/* Header */}
      <div style={{ 
        background: "rgba(26, 26, 46, 0.9)", 
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,107,157,0.2)",
        padding: "20px 32px",
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        boxShadow: "0 4px 30px rgba(0,0,0,0.3)",
        position: "relative",
        zIndex: 10
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ 
            width: 50, 
            height: 50, 
            background: "linear-gradient(135deg, #ff6b9d 0%, #c44569 100%)", 
            borderRadius: "50%", 
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 24,
            color: "white",
            fontWeight: "bold",
            boxShadow: "0 8px 25px rgba(255,107,157,0.4)",
            animation: "pulse 2s infinite"
          }}>
            KB
          </div>
          <div>
            <h2 style={{ 
              margin: 0, 
              color: "#e2e8f0", 
              fontSize: 24, 
              fontWeight: 800
            }}>
              Dashboard — {user?.name || user?.email}
            </h2>
            <p style={{ 
              margin: "4px 0 0", 
              color: "#a0aec0", 
              fontSize: 14,
              fontWeight: 500
            }}>
              Manage your projects and tasks efficiently.
            </p>
          </div>
        </div>
        <button 
          onClick={handleLogout} 
          style={{ 
            padding: "12px 24px", 
            background: "linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)", 
            color: "white", 
            border: "none", 
            borderRadius: 12,
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s ease",
            boxShadow: "0 4px 15px rgba(255, 107, 107, 0.4)"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 6px 20px rgba(255, 107, 107, 0.5)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 15px rgba(255, 107, 107, 0.4)";
          }}
        >
          Logout
        </button>
      </div>

      <div style={{ 
        padding: "32px"
      }}>

        {!currentBoard ? (
          <div style={{ 
            textAlign: "center", 
            padding: "80px 20px",
            background: "rgba(255, 255, 255, 0.8)",
            borderRadius: 20,
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.2)"
          }}>
            <div style={{ 
              width: 80, 
              height: 80, 
              backgroundColor: "#667eea", 
              borderRadius: "50%", 
              margin: "0 auto 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
              color: "white"
            }}>
              📋
            </div>
            <h3 style={{ 
              margin: "0 0 16px", 
              color: "#2d3748", 
              fontSize: 28, 
              fontWeight: 700 
            }}>
              No boards available
            </h3>
              <p style={{ 
              margin: "0 0 32px", 
              color: "#718096", 
              fontSize: 16 
            }}>
              Create a board to begin managing your workflow.
            </p>
            <button 
              onClick={createBoard} 
              style={{ 
                padding: "16px 32px", 
                background: "linear-gradient(135deg, #1fb6ff 0%, #0aa3ff 100%)", 
                color: "white", 
                border: "none", 
                borderRadius: 12,
                fontSize: 16,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s ease",
                boxShadow: "0 4px 15px rgba(31,182,255,0.18)"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 6px 20px rgba(31,182,255,0.28)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 15px rgba(31,182,255,0.18)";
              }}
            >
              Create Board
            </button>
          </div>
        ) : (
          <div>
            {/* Board Header */}
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center", 
              marginBottom: 32,
              background: "rgba(255, 255, 255, 0.8)",
              padding: "24px 32px",
              borderRadius: 16,
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.2)"
            }}>
              <div>
                <h3 style={{ 
                  margin: 0, 
                  color: "#2d3748", 
                  fontSize: 28, 
                  fontWeight: 700 
                }}>
                  {currentBoard.name}
                </h3>
                <p style={{ 
                  margin: "8px 0 0", 
                  color: "#718096", 
                  fontSize: 16 
                }}>
                  {currentBoard.columns.length} columns • {currentBoard.columns.reduce((acc, col) => acc + (col.tasks?.length || 0), 0)} tasks
                </p>
              </div>
              <button 
                onClick={() => setShowAddColumn(!showAddColumn)}
                style={{ 
                  padding: "12px 24px", 
                  background: "linear-gradient(135deg, #48bb78 0%, #38a169 100%)", 
                  color: "white", 
                  border: "none", 
                  borderRadius: 12,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  boxShadow: "0 4px 15px rgba(72, 187, 120, 0.4)"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 6px 20px rgba(72, 187, 120, 0.5)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 15px rgba(72, 187, 120, 0.4)";
                }}
              >
                + Add Column
              </button>
            </div>

            {/* Add Column Form */}
            {showAddColumn && (
              <div style={{ 
                marginBottom: 32, 
                padding: 24, 
                background: "rgba(255, 255, 255, 0.9)", 
                borderRadius: 16,
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.2)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.1)"
              }}>
                <h4 style={{ 
                  margin: "0 0 16px", 
                  color: "#2d3748", 
                  fontSize: 18, 
                  fontWeight: 600 
                }}>
                  Create new column
                </h4>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <input
                    type="text"
                    placeholder="Enter column title (e.g., In Progress, Review)"
                    value={newColumnTitle}
                    onChange={(e) => setNewColumnTitle(e.target.value)}
                    style={{ 
                      flex: 1,
                      padding: "16px 20px", 
                      borderRadius: 12, 
                      border: "2px solid #e2e8f0", 
                      fontSize: 16,
                      backgroundColor: "#f7fafc",
                      transition: "all 0.2s ease"
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#667eea";
                      e.target.style.backgroundColor = "white";
                      e.target.style.boxShadow = "0 0 0 3px rgba(102, 126, 234, 0.1)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#e2e8f0";
                      e.target.style.backgroundColor = "#f7fafc";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                  <button
                    onClick={createColumn}
                    style={{
                      padding: "16px 24px",
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      color: "white",
                      border: "none",
                      borderRadius: 12,
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 6px 20px rgba(102, 126, 234, 0.5)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 4px 15px rgba(102, 126, 234, 0.4)";
                    }}
                  >
                    Add column
                  </button>
                  <button 
                    onClick={() => setShowAddColumn(false)}
                    style={{ 
                      padding: "16px 24px", 
                      background: "linear-gradient(135deg, #a0aec0 0%, #718096 100%)", 
                      color: "white", 
                      border: "none", 
                      borderRadius: 12,
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.2s ease"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Kanban Board */}
            <div 
              className="kanban-board"
              style={{ 
                display: "flex", 
                gap: 24, 
                overflowX: "auto",
                paddingBottom: 20,
                minHeight: "calc(100vh - 300px)",
                flexWrap: "wrap"
              }}
            >
              {(currentBoard.columns ?? []).map((column) => (
                <div 
                  key={column.id} 
                  className="kanban-column"
                  style={{ 
                    background: "rgba(26, 26, 46, 0.8)", 
                    borderRadius: 20, 
                    padding: 24,
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(255,107,157,0.3)",
                    boxShadow: "0 12px 40px rgba(0,0,0,0.3)",
                    display: "flex",
                    flexDirection: "column",
                    height: "fit-content",
                    position: "relative",
                    overflow: "hidden"
                  }}
                >
                  {/* Column Header */}
                  <div style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "space-between",
                    marginBottom: 20,
                    paddingBottom: 16,
                    borderBottom: "2px solid #e2e8f0"
                  }}>
                    <h4 style={{ 
                      margin: 0, 
                      color: "#e2e8f0", 
                      fontSize: 18, 
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      gap: 8
                    }}>
                      <span style={{ 
                        width: 12, 
                        height: 12, 
                        borderRadius: "50%", 
                        background: "linear-gradient(135deg, #ff6b9d 0%, #4ecdc4 100%)",
                        boxShadow: "0 0 10px rgba(255,107,157,0.5)",
                        animation: "pulse 2s infinite"
                      }}></span>
                      {column.title}
                    </h4>
                    <span style={{ 
                      background: "linear-gradient(135deg, #ff6b9d 0%, #c44569 100%)", 
                      color: "white", 
                      padding: "6px 14px", 
                      borderRadius: 20, 
                      fontSize: 12, 
                      fontWeight: 700,
                      boxShadow: "0 4px 15px rgba(255,107,157,0.4)"
                    }}>
                      {(column.tasks ?? []).length} tasks
                    </span>
                  </div>
                  
                  {/* Add Task Form */}
                  <div style={{ marginBottom: 20 }}>
                    <input
                      type="text"
                      placeholder="Add a task..."
                      value={newTaskTitlesByColumn[column.id] ?? ""}
                      onChange={(e) => setNewTaskTitlesByColumn(prev => ({ ...prev, [column.id]: e.target.value }))}
                      style={{ 
                        width: "100%", 
                        padding: "14px 18px", 
                        borderRadius: 16, 
                        border: "2px solid rgba(255,107,157,0.3)", 
                        fontSize: 14,
                        backgroundColor: "rgba(255,255,255,0.05)",
                        color: "#e2e8f0",
                        marginBottom: 12,
                        transition: "all 0.3s ease",
                        backdropFilter: "blur(10px)"
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "#ff6b9d";
                        e.target.style.backgroundColor = "rgba(255,255,255,0.1)";
                        e.target.style.boxShadow = "0 0 0 3px rgba(255,107,157,0.2)";
                        e.target.style.transform = "translateY(-2px)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "rgba(255,107,157,0.3)";
                        e.target.style.backgroundColor = "rgba(255,255,255,0.05)";
                        e.target.style.boxShadow = "none";
                        e.target.style.transform = "translateY(0)";
                      }}
                    />
                    <button 
                      onClick={() => createTask(column.id)}
                      style={{ 
                        width: "100%", 
                        padding: "14px 18px", 
                        background: "linear-gradient(135deg, #1fb6ff 0%, #0aa3ff 100%)", 
                        color: "white", 
                        border: "none", 
                        borderRadius: 16,
                        fontSize: 14,
                        fontWeight: 700,
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        boxShadow: "0 6px 20px rgba(31,182,255,0.18)",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-3px)";
                        e.currentTarget.style.boxShadow = "0 8px 25px rgba(31,182,255,0.28)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 6px 20px rgba(31,182,255,0.18)";
                      }}
                    >
                      Add Task
                    </button>
                  </div>

                  {/* Tasks */}
                  <div style={{ 
                    display: "flex", 
                    flexDirection: "column", 
                    gap: 12,
                    minHeight: 200,
                    flex: 1
                  }}>
                    {(column.tasks ?? []).map((task) => (
                      <div 
                        key={task.id} 
                        className="task-card"
                        style={{ 
                          background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)", 
                          padding: 16, 
                          borderRadius: 16, 
                          border: "1px solid rgba(255,107,157,0.2)",
                          boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
                          transition: "all 0.3s ease",
                          cursor: "pointer",
                          backdropFilter: "blur(10px)",
                          position: "relative",
                          overflow: "hidden"
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "translateY(-4px)";
                          e.currentTarget.style.boxShadow = "0 8px 30px rgba(255,107,157,0.3)";
                          e.currentTarget.style.borderColor = "rgba(255,107,157,0.5)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.2)";
                          e.currentTarget.style.borderColor = "rgba(255,107,157,0.2)";
                        }}
                      >
                        <div style={{ 
                          display: "flex", 
                          justifyContent: "space-between", 
                          alignItems: "flex-start",
                          gap: 12
                        }}>
                          <span style={{ 
                            color: "#e2e8f0", 
                            fontSize: 14, 
                            fontWeight: 600,
                            lineHeight: 1.5,
                            flex: 1
                          }}>
                            {task.title}
                          </span>
                          <button 
                            onClick={() => deleteTask(task.id)}
                            style={{ 
                              background: "linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)", 
                              color: "white", 
                              border: "none", 
                              borderRadius: 12, 
                              padding: "8px 12px",
                              fontSize: 12,
                              fontWeight: 700,
                              cursor: "pointer",
                              transition: "all 0.3s ease",
                              flexShrink: 0,
                              boxShadow: "0 4px 15px rgba(255,107,107,0.4)"
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = "scale(1.1)";
                              e.currentTarget.style.boxShadow = "0 6px 20px rgba(255,107,107,0.6)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = "scale(1)";
                              e.currentTarget.style.boxShadow = "0 4px 15px rgba(255,107,107,0.4)";
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                    
                    {(column.tasks ?? []).length === 0 && (
                      <div style={{ 
                        textAlign: "center", 
                        padding: "40px 20px", 
                        color: "#a0aec0",
                        fontSize: 14,
                        fontStyle: "italic",
                        background: "rgba(255,255,255,0.02)",
                        borderRadius: 12,
                        border: "2px dashed rgba(255,107,157,0.2)"
                      }}>
                        No tasks in this column. Add a task to get started.
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
