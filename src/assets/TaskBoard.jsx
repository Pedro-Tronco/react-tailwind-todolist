import { useEffect, useState } from "react";

const colors = [
    "bg-yellow-200",
    "bg-green-200",
    "bg-pink-200",
    "bg-blue-200",
    "bg-orange-200",
    "bg-lime-200",
    "bg-amber-200"
];

// Mapeamento das cores para tons mais escuros (50% mais escuro)
// A saturação será reduzida via inline style usando filter: saturate(70%)
const borderColors = {
    "bg-yellow-200": "border-yellow-600",
    "bg-green-200": "border-green-600",
    "bg-pink-200": "border-pink-600",
    "bg-blue-200": "border-blue-600",
    "bg-orange-200": "border-orange-600",
    "bg-lime-200": "border-lime-600",
    "bg-amber-200": "border-amber-600"
};

export function TaskBoard() {
    const [note, setNote] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newTask, setNewTask] = useState({ title: "", userId: "" }); // removido completed
    const [error, setError] = useState("");

    useEffect(() => {
        Promise.all([
            fetch("https://jsonplaceholder.typicode.com/posts/1").then(res => res.json()),
            fetch("https://jsonplaceholder.typicode.com/todos").then(res => res.json())
        ]).then(([noteData, tasksData]) => {
            setNote(noteData);
            setTasks(tasksData);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    // Função para alternar o status completed localmente
    const toggleCompleted = (id) => {
        setTasks(tasks =>
            tasks.map(task =>
                task.id === id
                    ? { ...task, completed: !task.completed, favorite: task.completed ? task.favorite : false }
                    : task
            )
        );
    };

    // Função para alternar o status de favorito
    const toggleFavorite = (id) => {
        setTasks(tasks =>
            tasks.map(task =>
                task.id === id ? { ...task, favorite: !task.favorite } : task
            )
        );
    };

    // Função para remover uma task
    const handleDeleteTask = (id) => {
        setTasks(tasks => tasks.filter(task => task.id !== id));
    };

    // IDs já usados
    const usedIds = tasks.map(t => t.id);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewTask((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCreateTask = (e) => {
        e.preventDefault();
        setError("");
        const title = newTask.title.trim();
        const userId = newTask.userId.trim();
        if (!title || !userId) {
            setError("Preencha todos os campos.");
            return;
        }
        if (title.length > 100) {
            setError("O título deve ter no máximo 100 caracteres.");
            return;
        }
        // Gera um novo ID único
        let newId = 1;
        while (usedIds.includes(newId)) newId++;
        setTasks(tasks => [
            ...tasks,
            { ...newTask, id: newId, title: title, userId: userId, completed: false, favorite: false }
        ]);
        setShowModal(false);
        setNewTask({ title: "", userId: "" });
    };

    if (loading) {
        return <div className="text-center text-[#6B4F27] py-4">Carregando...</div>;
    }

    // Ordena tasks: favoritos primeiro, depois não favoritos, depois concluídas
    const sortedTasks = [...tasks].sort((a, b) => {
        // Tasks concluídas sempre no final
        if (a.completed && !b.completed) return 1;
        if (!a.completed && b.completed) return -1;
        // Entre não concluídas, favoritos primeiro
        if (!a.completed && !b.completed) {
            return (b.favorite === true) - (a.favorite === true);
        }
        // Entre concluídas, ordem original
        return 0;
    });

    return (
        <div>
            {/* Cabeçalho com botão de adicionar tarefa */}
            <div className="sticky top-0 z-20 bg-yellow-100 flex justify-between items-center px-4 py-2 border-b-2 border-b-[#8B5C2A]">
                <span className="text-lg font-bold text-[#6B4F27]">Tarefas</span>
                <button
                    className="bg-[#8B5C2A] text-white px-4 py-2 rounded shadow hover:bg-[#6B4F27] transition"
                    onClick={() => setShowModal(true)}
                >
                    Nova Tarefa
                </button>
            </div>

            {/* Modal para criar nova tarefa */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                    <form
                        className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm flex flex-col gap-4"
                        onSubmit={handleCreateTask}
                    >
                        <h2 className="text-lg font-bold text-[#6B4F27] mb-2">Nova Tarefa</h2>
                        <input
                            name="title"
                            placeholder="Título (máx. 100 caracteres)"
                            className="border rounded px-3 py-2"
                            value={newTask.title}
                            onChange={handleInputChange}
                            maxLength={100}
                            required
                        />
                        <input
                            name="userId"
                            placeholder="Usuário"
                            className="border rounded px-3 py-2"
                            value={newTask.userId}
                            onChange={handleInputChange}
                            required
                        />
                        {/* Removido checkbox de concluída */}
                        {error && <div className="text-red-600 text-sm">{error}</div>}
                        <div className="flex gap-2 justify-end">
                            <button
                                type="button"
                                className="px-3 py-1 rounded bg-gray-200"
                                onClick={() => {
                                    setShowModal(false);
                                    setError("");
                                    setNewTask({ title: "", userId: "" });
                                }}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="px-3 py-1 rounded bg-[#8B5C2A] text-white"
                            >
                                Criar
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Lista de tarefas em 3 colunas, cada uma como post-it */}
            <style>
                {`
                .task-animate {
                    transition: transform 0.3s cubic-bezier(.4,2,.6,1), box-shadow 0.2s;
                }
                `}
            </style>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 py-6">
                {sortedTasks.length === 0 && (
                    <div className="text-center text-[#6B4F27] col-span-3">Nenhuma tarefa encontrada.</div>
                )}
                {sortedTasks.map((task, idx) => {
                    const color = colors[(idx + 1) % colors.length];
                    const borderColor = borderColors[color] || "border-yellow-600";
                    const completedStyles = task.completed
                        ? {
                            opacity: 0.6,
                            filter: "saturate(56%)"
                        }
                        : {
                            opacity: 1,
                            filter: "saturate(70%)"
                        };
                    return (
                        <div
                            key={task.id || idx}
                            className={`task-animate ${color} rounded-lg shadow-lg p-6 border-2 ${borderColor} relative`}
                            style={{
                                minHeight: "120px",
                                boxShadow: "2px 4px 18px 0 rgba(0,0,0,0.10), 0 1.5px 0 0 #eab308",
                                ...completedStyles
                            }}
                        >
                            {/* Botões no canto superior direito */}
                            <div className="absolute top-2 right-2 flex gap-2">
                                <button
                                    className={`${color} hover:brightness-90 text-[#6B4F27] border ${borderColor} rounded px-2 py-1 text-xs shadow flex items-center`}
                                    onClick={() => toggleFavorite(task.id)}
                                    title={task.favorite ? "Desfavoritar" : "Favoritar"}
                                >
                                    {task.favorite ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 fill-yellow-500 stroke-yellow-700" viewBox="0 0 20 20">
                                            <polygon points="10,2 12.59,7.36 18.51,8.09 14,12.26 15.18,18.09 10,15.1 4.82,18.09 6,12.26 1.49,8.09 7.41,7.36" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 stroke-yellow-700" fill="none" viewBox="0 0 20 20">
                                            <polygon points="10,2 12.59,7.36 18.51,8.09 14,12.26 15.18,18.09 10,15.1 4.82,18.09 6,12.26 1.49,8.09 7.41,7.36" stroke="currentColor" strokeWidth="1.5" />
                                        </svg>
                                    )}
                                </button>
                                <button
                                    className={`${color} hover:brightness-90 text-[#6B4F27] border ${borderColor} rounded px-2 py-1 text-xs shadow flex items-center`}
                                    onClick={() => handleDeleteTask(task.id)}
                                    title="Apagar"
                                >
                                    <span className="font-extrabold text-xl leading-none">X</span>
                                </button>
                            </div>
                            <div className="flex items-center mb-1">
                                <input
                                    type="checkbox"
                                    checked={task.completed}
                                    onChange={() => toggleCompleted(task.id)}
                                    className="mr-2 accent-yellow-700"
                                />
                                <span className="font-bold text-[#6B4F27]">Tarefa #{task.id}</span>
                            </div>
                            <div className="text-[#6B4F27] text-base mb-1">{task.title}</div>
                            <div className="text-xs text-[#6B4F27] mb-1">Usuário: {task.userId}</div>
                            <div className="text-xs text-[#6B4F27]">
                                Status: {task.completed ? "Concluída" : "Pendente"}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
