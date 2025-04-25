// src/components/NotesWidget.tsx
'use client'
import { useAppContext } from '../context/AppContext';

const NotesWidget = () => {
  const { notes, setNotes } = useAppContext();

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 h-64 flex flex-col">
      <h2 className="text-xl font-bold text-white mb-4">Notes</h2>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Type your notes here..."
        className="flex-grow bg-white/5 text-white p-2 rounded-lg focus:outline-none resize-none"
      />
    </div>
  );
};

export default NotesWidget;