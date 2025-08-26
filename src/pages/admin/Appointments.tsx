import { useEffect, useState } from "react";

type Appointment = {
  id: number;
  patient: string;
  date: string; // ISO format: 'YYYY-MM-DD'
  time: string; // 'HH:mm'
};

const mockAppointments: Appointment[] = [
  { id: 1, patient: "João Silva", date: "2025-08-26", time: "09:00" },
  { id: 2, patient: "Maria Souza", date: "2025-08-27", time: "11:30" },
];

function getTodayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function Appointments() {
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    // Replace mockAppointments with API call if needed
    const today = getTodayISO();
    const filtered = mockAppointments.filter(a => a.date === today);
    setTodayAppointments(filtered);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold">Agendamentos</h1>
      <p>Page Core dos agendamentos dos pacientes</p>
      <div className="mt-4">
        <h2 className="text-lg font-bold">Agendamentos de hoje</h2>
        {todayAppointments.length === 0 ? (
          <p>Nenhum agendamento para hoje.</p>
        ) : (
          <ul>
            {todayAppointments.map(a => (
              <li key={a.id}>
                {a.time} - {a.patient}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}