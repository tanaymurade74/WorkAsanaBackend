const express = require("express")
const cors = require("cors")
const bcrypt = require("bcrypt")
const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};


const jwt = require("jsonwebtoken");

const app = express();

const SECRET_KEY = "secretUser";
const JWT_TOKEN = "jwt_secret";
app.use(cors(corsOptions));
app.use(express.json());

const {initializeDatabase} = require("./db/db.connect")

const User = require("./models/User.model")
const Task = require("./models/Task.model")
const Team = require("./models/Team.model");
const Tag = require("./models/Tag.model")
const Project = require("./models/Project.model");


initializeDatabase();


async function createUser(details){
    try{
      const createdUser = await User.create(details);
      return createdUser;
    }catch(error){
        throw error
    }

}

async function getAllUsers(){
    try{
        const users = await User.find();
        return users;
    }catch(error){
        throw error;
    }
}

async function createTask(task){
    try{
        const taskToCreate = new Task(task);
        const createdTask = await taskToCreate.save();
        return createdTask;
    }catch(error){
        console.log(error)
        throw error;
    }
}

async function getAllTasks(){
    try{
        const tasks = await Task.find();
        return tasks;
    }catch(error){
        throw error;
    }
}

async function createTeam(team){
    try{
        const teamToCreate = new Team(team);
        const createdTeam = await teamToCreate.save();
        return createdTeam
    }catch(error){
        throw error;
    }
}



async function createProject(project){
    try{
        const projectToCreate = new Project(project);
        const createdProject = await projectToCreate.save();
        return createdProject
    }catch(error){
        throw error;
    }
}

async function getAllProjects(){
    try{
        const projects = await Project.find();
        return projects
    }catch(error){
        throw error;
    }
}

async function getAllTeams(){
    try{
        const teams = await Team.find();
        return teams;
    }catch(error){
        throw error;
    }
}

async function getTasksByOwners(ownerId){
    try{
        const tasks = await Task.find({owners: ownerId});
        return tasks;
    }catch(error){
        throw error;
    }
}

async function updateTeamById(id, task){
    try{
        const updatedTeam = await Team.findByIdAndUpdate({_id:id}, task, {new: true})
        return updatedTeam;
    }catch(error){
        return error;
    }
}

async function getProjectById(id){
    try{
        const project = await Project.findById(id);
        return project;
    }catch(error){
        console.log(error);
        throw error;
    }
}

async function getTasksForProject(projectId){
    try{
        const tasks = await Task.find({project: projectId});
        return tasks;
    }catch(error){
        console.log(error);
        throw error;
    }
}

async function getUserById(id){
    try{
        const user = await User.findById(id);
        return user;
    }catch(error){
        throw error;
    }
}

async function getTeamById(id){
    try{
        const team = await Team.findById(id);
        return team;
    }catch(error){
        throw error;
    }
}

async function getTaskById(id){
    try{
        const task = await Task.findById(id);
        return task;
    }catch(error){
        console.log(error);
        throw error;
    }
}

async function updateTask(id, body){
    try{
        const updatedTask = await Task.findByIdAndUpdate({_id: id}, body, {new: true});
        return updatedTask;
    }catch(error){
        console.log(error);
        throw error;
    }
}

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; 

    if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    jwt.verify(token, JWT_TOKEN, (err, decodedUser) => {
        if (err) {
            return res.status(403).json({ message: "Invalid or expired token." });
        }
        
        req.user = decodedUser; 
        next(); 
    });
}

app.get("/auth/me", authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json({ User: user });
    } catch (error) {
        return res.status(500).json({ Error: "Error fetching user details" });
    }
});


app.post("/auth/signup", async (req, res)=>{
    const {name, email, password} = req.body;

    if(!name || !email || !password){
        return res.status(400).json({message: "Provide all the Details"})

    }
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
        return res.status(409).json({ message: "Email already registered" });
    }
    
    const saltRounds = 10;
    const hashPassword = await bcrypt.hash(password, saltRounds);
   try{
    const user = await createUser({name: name, email: email, password: hashPassword});
    if(user){
        return res.status(201).json({ message: "User created",User: {id: user._id, name: user.name, email: user.email}})
    }
    

}catch{
    return res.status(500).json({Error: "Error while trying to add user"})
}
})

app.post("/auth/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Provide email and password" });
    }

    try {
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(404).json({ message: "Invalid email or password" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(404).json({ message: "Invalid email or password" });
        }

        const token = jwt.sign(
            { userId: user._id, email: user.email }, 
            JWT_TOKEN, 
            { expiresIn: "24h" } 
        );

        return res.status(200).json({
            message: "Login successful",
            token: token,
            User: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ Message: "Error while trying to log in"});
    }
});

app.post("/tasks", authenticateToken, async (req, res)=>{
    try{
        const task = await createTask(req.body);
        if(task){
            return res.status(200).json({Message: "Task Created", Task: task});
        }
    }catch{
        return res.status(500).json({Error: "Unable to add task"})
    }
})

app.patch("/teams/:id", authenticateToken, async (req, res)=>{
    try{
        const updatedTeam = await updateTeamById(req.params.id, req.body);
        if(!updatedTeam){
            return res.status(404).json({Error: "Id not present"})
        }
        return res.status(200).json({Message: "Team updted", Team: updatedTeam})

    }catch{
        return res.status(500).json({Error: "Error while patching"})
    }
})

app.get("/tasks", authenticateToken, async (req, res)=>{
    try{
        const tasks = await getAllTasks();
        if(tasks){
            return res.status(200).json({Task: tasks})
        }
    }catch{
        return res.status(500).json({Error: "Error while trying to get tasks"})
    }
})

app.get("/tasks/taskDetail/:taskId", authenticateToken, async (req, res) => {
    try{
        const task = await getTaskById(req.params.taskId);
        if(!task){
            return res.status(404).json({Error: "Task id not present"})
        }

        return res.status(200).json({Task: task})
    }catch{
        return res.status(500).json({Error: "Error while trying to fetch task"})
    }
})


app.get("/tasks/:ownerId", authenticateToken, async(req, res)=>{
    try{
        const tasks = await getTasksByOwners(req.params.ownerId);
        if(tasks){
            return res.status(200).json({Task: tasks})
        }
    }catch{
        return res.status(500).json({Error: "Error while fetching tasks"})
    }
})

app.get("/tasks/project/:projectId", authenticateToken, async (req, res)=>{
    try{
        const tasks = await getTasksForProject(req.params.projectId);
        if(!tasks){
            return res.status(404).json({Error: "Project not present"})
        }
        return res.status(200).json({Tasks: tasks})
    }catch{
        return res.status(500).json({Error: "Error while trying to fetch tasks"})
    }
})


app.patch("/tasks/:taskId", authenticateToken, async(req, res)=>{
    try{
        const updatedTask = await updateTask(req.params.taskId, req.body)
        if(!updatedTask){
            return res.status(404).json({Error: "Task id not present"})
        }
        return res.status(200).json({Message:"Task status updated", Task: updatedTask})
    }catch{
        return res.status(500).json({Error: "Error while trying to update status"})
    }
})

app.post("/projects", authenticateToken, async (req, res)=>{
    try{
        const project = await createProject(req.body);
        if(project){
            return res.status(200).json({Message: "Project Created", Project: project})
        }
    }catch{
        return res.status(500).json({Error: "Error while trying to addd projects"})
    }
})

app.get("/projects", authenticateToken, async (req, res)=>{
    try{
        const projects = await getAllProjects();
        if(projects){
            return res.status(200).json({Projects: projects})
        }
    }catch{
        return res.status(500).json({Error: "Error while trying to add project"})
    }
})

app.get("/projects/:projectId", authenticateToken, async (req, res)=>{
    try{
        const project = await getProjectById(req.params.projectId);
        if(!project){
            return res.status(404).json({Error: "Id not present"})
        }
        return res.status(200).json({Project: project})
    }catch{
        return res.status(500).json({Error: "Error while trying to fetch project"})
    }
})

app.post("/teams",authenticateToken, async (req, res)=>{
    try{
        const team = await createTeam(req.body);
        if(team){
            return res.status(200).json({Message: "Team created", Team: team })
        }
    }catch(error){
        return res.status(500).json({Error: error})
    }
})

app.get("/teams", authenticateToken, async (req, res)=>{
    try{
        const teams = await getAllTeams();
        if(teams){
            return res.status(200).json({Teams: teams})
        }
    }catch{
        return res.status(500).json({Error: "Error while trying to get teams"})
    }
})

app.get("/teams/:teamId", authenticateToken, async (req, res)=>{
    try{
        const team = await getTeamById(req.params.teamId);
        if(!team){
            return res.status(404).json({Error:"Team id not present"})
        }
        return res.status(200).json({Team: team});
    }catch{
        return res.status(500).json({Error: "Error while fetching team"})
    }
})


app.get("/users", authenticateToken, async (req, res)=>{
    try{
        const users = await getAllUsers();
        if(users){
            return res.status(200).json({Users: users})

        }
    }catch{
        return res.status(500).json({Error: "Error while trying to get users"})
    }
})

app.get("/users/:userId", authenticateToken, async (req, res)=>{
    try{
        const user = await getUserById(req.params.userId);
        if(!user){
            return res.status(404).json({Error: "User id not present"})
        }
        return res.status(200).json({User: user})
    }catch{
        return res.status(500).json({Error:"Error while fetching user"})
    }
})


app.delete("/tasks/:taskId", authenticateToken, async (req, res) => {
    try {
        const deletedTask = await Task.findByIdAndDelete(req.params.taskId);
        
        if (!deletedTask) {
            return res.status(404).json({ Error: "Task not found" });
        }
        
        return res.status(200).json({ Message: "Task deleted successfully." });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ Error: "Error deleting task." });
    }
});

app.delete("/teams/:teamId", authenticateToken, async (req, res) => {
    try {
        const teamId = req.params.teamId;

        await Task.updateMany({ team: teamId }, { $set: { team: null } });

        const deletedTeam = await Team.findByIdAndDelete(teamId);

        if (!deletedTeam) {
            return res.status(404).json({ Error: "Team not found" });
        }

        return res.status(200).json({ Message: "Team deleted and tasks unassigned." });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ Error: "Error deleting team." });
    }
});

app.delete("/projects/:projectId", authenticateToken, async (req, res) => {
    try {
        const projectId = req.params.projectId;

        await Task.deleteMany({ project: projectId });

        const deletedProject = await Project.findByIdAndDelete(projectId);

        if (!deletedProject) {
            return res.status(404).json({ Error: "Project not found" });
        }

        return res.status(200).json({ Message: "Project and all associated tasks deleted." });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ Error: "Error deleting project." });
    }
});

app.get("/report/last-week", authenticateToken, async (req, res) => {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const tasks = await Task.find({
            status: "Completed",
            updatedAt: { $gte: sevenDaysAgo }
        });

        return res.status(200).json({ Tasks: tasks });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ Error: "Error fetching last week's tasks" });
    }
});


app.get("/report/lastWeek", authenticateToken, async (req, res) => {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const tasks = await Task.find({
            status: "Completed",
            updatedAt: { $gte: sevenDaysAgo }
        });

        return res.status(200).json({ Tasks: tasks });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ Error: "Error fetching last week's tasks" });
    }
});

app.get("/report/pending", authenticateToken, async (req, res) => {
    try {
        const pendingTasks = await Task.find({ status: { $ne: "Completed" } });

        const totalPendingDays = pendingTasks.reduce((total, task) => {
            return total + (task.timeToComplete || 0);
        }, 0);

        return res.status(200).json({ 
            totalDays: totalPendingDays, 
            Tasks: pendingTasks 
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ Error: "Error calculating pending work" });
    }
});


app.get("/report/closedTasks", authenticateToken, async (req, res) => {
    try {
        const closedTasks = await Task.find({ status: "Completed" })
            .populate("team", "name")
            .populate("project", "name")
            .populate("owners", "name");

        const closedByTeam = closedTasks.reduce((acc, task) => {
            const teamName = task.team?.name || "Unassigned";
            acc[teamName] = (acc[teamName] || 0) + 1;
            return acc;
        }, {});

        const closedByProject = closedTasks.reduce((acc, task) => {
            const projectName = task.project?.name || "Unassigned";
            acc[projectName] = (acc[projectName] || 0) + 1;
            return acc;
        }, {});

        const closedByOwner = closedTasks.reduce((acc, task) => {
            if (task.owners && task.owners.length > 0) {
                task.owners.forEach(owner => {
                    const ownerName = owner?.name || "Unknown";
                    acc[ownerName] = (acc[ownerName] || 0) + 1;
                });
            } else {
                acc["Unassigned"] = (acc["Unassigned"] || 0) + 1;
            }
            return acc;
        }, {});

        return res.status(200).json({
            byTeam: closedByTeam,
            byProject: closedByProject,
            byOwner: closedByOwner
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ Error: "Error fetching closed tasks" });
    }
});


app.listen("3001", () => console.log("Server running on port 3001"))