import { useState } from 'react';
import { Provider } from 'react-redux';
import { store } from './task3-global-state/store/store';
import { TransactionList } from './task1-fetch-list/TransactionList';
import { SendMoneyForm } from './task2-form-validation/SendMoneyForm';
import { WatchlistApp } from './task3-global-state/WatchlistApp';
import { CardSearch } from './task4-complex-ux/CardSearch';

// A union of string literals restricts `activeTask` to exactly these 4 values —
// assigning anything else is a compile error, so the tab list below and this
// type can never quietly drift apart.
type TaskId = 'task1' | 'task2' | 'task3' | 'task4';

const TASKS: Array<{ id: TaskId; label: string }> = [
  { id: 'task1', label: 'Task 1: Fetch + List' },
  { id: 'task2', label: 'Task 2: Form Validation' },
  { id: 'task3', label: 'Task 3: Global State' },
  { id: 'task4', label: 'Task 4: Complex UX' },
];

function App() {
  const [activeTask, setActiveTask] = useState<TaskId>('task1');

  return (
    <div style={{ maxWidth: 640, margin: '2rem auto', fontFamily: 'system-ui, sans-serif' }}>
      <h1>Revolut Interview Prep</h1>
      <nav style={{ display: 'flex', gap: 8, marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {TASKS.map((task) => (
          <button
            key={task.id}
            onClick={() => setActiveTask(task.id)}
            disabled={activeTask === task.id}
          >
            {task.label}
          </button>
        ))}
      </nav>

      {activeTask === 'task1' && <TransactionList failureRate={0.3} />}
      {activeTask === 'task2' && <SendMoneyForm />}
      {activeTask === 'task3' && (
        <Provider store={store}>
          <WatchlistApp />
        </Provider>
      )}
      {activeTask === 'task4' && <CardSearch failureRate={0.3} />}
    </div>
  );
}

export default App;
