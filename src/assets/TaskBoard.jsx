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
                task.id === id ? { ...task, completed: !task.completed } : task
            )
        );
    };

    if (loading) {
        return <div className="text-center text-[#6B4F27] py-4">Carregando...</div>;
    }

    return (
        <div>
            {/* Lista de tarefas em 3 colunas, cada uma como post-it */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 py-6">
                {tasks.length === 0 && (
                    <div className="text-center text-[#6B4F27] col-span-3">Nenhuma tarefa encontrada.</div>
                )}
                {tasks.map((task, idx) => {
                    const color = colors[(idx + 1) % colors.length];
                    const borderColor = borderColors[color] || "border-yellow-600";
                    // Feedback visual: tarefas concluídas ficam com opacidade reduzida e saturação menor, mas sem risco no texto
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
                            className={`${color} rounded-lg shadow-lg p-6 border-2 ${borderColor}`}
                            style={{
                                minHeight: "120px",
                                boxShadow: "2px 4px 18px 0 rgba(0,0,0,0.10), 0 1.5px 0 0 #eab308",
                                ...completedStyles
                            }}
                        >
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
