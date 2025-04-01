import { useState } from 'react';
import { ChevronDown, CheckCircle } from 'lucide-react';

const notifications = [
  {
    id: 1,
    title: 'Report overdue by {{ 0 days }}.',
    message: 'Reminder sent to student.',
    time: '2h',
    status: 'dot'
  },
  {
    id: 2,
    title: 'Supervisor Not Assigned',
    message: 'Student {{ Fullname }}. {{ Passed/Failed }} Viva defense. Status updated.',
    time: 'open',
    status: 'checked'
  },
  {
    id: 3,
    title: 'Proposal review not started {{ 0 days }} after submission. Follow-up needed.',
    time: '14 Feb',
    status: 'dot'
  }
];

const DNotificationLog = () => {
  const [activeTab, setActiveTab] = useState('feed');

  return (
    <div className="bg-white p-4 rounded-lg shadow-md min-w-80">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold">Notification Log</h2>
        <button className="bg-[#23388F] text-white px-3 py-1 rounded-md text-sm flex items-center">
          View More <ChevronDown size={14} className="ml-1" />
        </button>
      </div>

      <div className="flex items-center border-b pb-2">
        <button
          className={`relative text-sm font-medium mr-4 ${activeTab === 'feed' ? 'text-black' : 'text-gray-500'}`}
          onClick={() => setActiveTab('feed')}
        >
          Feed
          <span className="ml-1 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">5</span>
        </button>
      </div>

      <div className="mt-3 space-y-3">
        {notifications.map((notif) => (
          <div key={notif.id} className="flex items-start space-x-2">
            {notif.status === 'dot' && <span className="h-2 w-2 bg-blue-500 rounded-full mt-1"></span>}
            {notif.status === 'checked' && <CheckCircle size={16} className="text-gray-400 mt-1" />}

            <div className="flex-1">
              <p className="text-sm font-semibold">{notif.title}</p>
              <p className="text-xs text-gray-500">{notif.message}</p>
              {notif.time === 'open' ? (
                <span className="bg-[#23388F] text-white px-2 py-0.5 text-xs font-semibold rounded-md mt-1 inline-block">
                  Open
                </span>
              ) : (
                <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DNotificationLog;
