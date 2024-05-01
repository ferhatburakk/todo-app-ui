import {
  Box,
  Button,
  Container,
  FormLabel,
  Grid,
  TextField,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import axios from "axios";
import { useState } from "react";
import { TodoType, UserType } from "./type";

function App() {
  const [user, setUser] = useState<UserType | null>(null);
  const [userId, setUserId] = useState(0);
  const [todoId, setTodoId] = useState(0);
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [loginText, setLoginText] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [header, setHeader] = useState("");
  const [content, setContent] = useState("");
  const [todos, setTodos] = useState<TodoType[]>([]);
  const [rows, setRows] = useState([]);

  const completeById = (userId: number, todoId: number) => {
    const url = `http://localhost:8080/user/complete/${userId}/${todoId}`;

    axios
      .put(url)
      .then((res) => {
        const result = res.data;
        console.log(result);
        getTodos();
      })
      .catch((error) => {
        console.error("Hata:", error);
      });
  };

  const revertById = (userId: number, todoId: number) => {
    const url = `http://localhost:8080/user/revert/${userId}/${todoId}`;

    axios
      .put(url)
      .then((res) => {
        const result = res.data;
        console.log(result);
        getTodos();
      })
      .catch((error) => {
        console.error("Hata:", error);
      });
  };

  const login = () => {
    const params = {
      userName: userName,
      password: password,
    };
    axios
      .get(`http://localhost:8080/user/login`, {
        params: params,
      })
      .then((res) => {
        const user = res.data;
        setUser(user);
        setIsLoggedIn(true);
        console.log("loggedin:" + isLoggedIn);
        getTodos();
      })
      .catch((error) => {
        console.log("76");
        setLoginText("Please check your username or password");
      });
  };

  const signUp = () => {
    const url = `http://localhost:8080/user/save`;
    const params = {
      userName: userName,
      password: password,
    };
    axios
      .post(url, params)
      .then((res) => {
        setLoginText("Signed Up Successfully");
        console.log(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUser(null);
    setLoginText("");
    setUserName("");
    setPassword("");
    setTodos([]);
  };

  const isSaveButtonDisabled = header === "" || content === "" || !isLoggedIn;

  const save = () => {
    const todoBody = {
      header: header,
      content: content,
      isCompleted: 0,
    };

    const url = `http://localhost:8080/todo/saveByUserName/${userName}`;
    console.log(url);
    axios
      .post(url, todoBody)
      .then((res) => {
        setContent("");
        setHeader("");
        getTodos();
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const getTodos = () => {
    const url = `http://localhost:8080/todo/getTodosByUserName/${userName}`;
    axios
      .get(url)
      .then((res) => {
        console.log("Todos verisi:", res.data);
        setTodos(res.data);
        setRows(res.data);
        console.log("rows: " + rows);
      })
      .catch((err) => {
        console.error("Todo verilerini alırken hata:", err);
      });
  };

  const deleteById = (id: number) => {
    const url = `http://localhost:8080/todo/deleteById/${id}/${userName}`;
    axios
      .delete(url)
      .then((res) => {
        getTodos();
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const columns: GridColDef[] = [
    { field: "header", headerName: "Header", width: 150 },
    { field: "content", headerName: "Content", width: 150 },
    {
      field: "isCompleted",
      headerName: "Is Completed?",
      width: 165,
      renderCell: (params) => {
        return (
          <Box
            bgcolor={params.value === 1 ? "green" : "red"}
            width={25}
            height={25}
            mt={2}
            ml={4}
            borderRadius={40}
          />
        );
      },
    },
    {
      field: "CompleteButton",
      headerName: "Complete",
      width: 150,
      renderCell: (params) => {
        if (params.row.isCompleted) {
          return (
            <Button
              variant="outlined"
              color="error"
              onClick={() => {
                if (user !== null) {
                  revertById(user.id, params.row.id);
                }
              }}
            >
              Revert
            </Button>
          );
        }
        return (
          !params.row.isCompleted && (
            <Button
              variant="contained"
              color="success"
              onClick={() => {
                if (user !== null) {
                  completeById(user.id, params.row.id);
                }
              }}
            >
              Complete
            </Button>
          )
        );
      },
    },

    {
      field: "delete",
      headerName: "Delete",
      width: 150,
      renderCell: (params) => {
        return (
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              deleteById(params.row.id);
            }}
          >
            Delete
          </Button>
        );
      },
    },
  ];

  return (
    <div className="App">
      <Container style={{ marginTop: 15 }}>
        <Grid style={{ marginBottom: 30 }}>
          {!isLoggedIn && (
            <TextField
              style={{ marginRight: 15 }}
              label="userName"
              value={userName}
              onChange={(e) => {
                setUserName(e.target.value);
              }}
              disabled={isLoggedIn}
            />
          )}
          {!isLoggedIn && (
            <TextField
              inputProps={{ type: "password" }}
              label="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
              }}
              disabled={isLoggedIn}
            />
          )}

          {!isLoggedIn && (
            <Button
              variant="contained"
              color="success"
              style={{ marginLeft: 15 }}
              onClick={login}
              disabled={isLoggedIn}
            >
              Login
            </Button>
          )}
          {!isLoggedIn && (
            <Button
              variant="outlined"
              color="success"
              style={{ marginLeft: 15 }}
              onClick={signUp}
              disabled={isLoggedIn}
            >
              Sign Up
            </Button>
          )}
          <FormLabel
            sx={{ color: !isLoggedIn ? "red" : "green", marginLeft: 3 }}
          >
            {isLoggedIn ? userName : loginText}
          </FormLabel>
          {isLoggedIn && (
            <Button
              variant="outlined"
              color="error"
              style={{ marginLeft: 15 }}
              onClick={logout}
              disabled={!isLoggedIn}
            >
              Logout
            </Button>
          )}
        </Grid>
        {isLoggedIn && (
          <Grid>
            <TextField
              label="header"
              value={header}
              onChange={(e) => {
                setHeader(e.target.value);
              }}
            />

            <TextField
              style={{ marginLeft: 15 }}
              label="content"
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
              }}
            />
            <Button
              variant="outlined"
              color="success"
              style={{ marginLeft: 15 }}
              onClick={save}
              disabled={isSaveButtonDisabled}
            >
              Save
            </Button>
          </Grid>
        )}
        <Grid container spacing={2} mt={4}>
          {isLoggedIn && (
            <DataGrid
              columns={columns}
              rows={todos}
              autoHeight
              rowSelection={false}
            />
          )}
        </Grid>
      </Container>
    </div>
  );
}

export default App;
