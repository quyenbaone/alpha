import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar, DateLocalizer, dateFnsLocalizer, NavigateAction } from 'react-big-calendar';
import { format, getDay, parse, startOfWeek, addMonths, addDays, subMonths } from 'date-fns';
import { vi } from 'date-fns/locale/vi';
import { useEffect, useState } from 'react';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { supabase } from '../lib/supabase';

const locales = { vi };
const localizer: DateLocalizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface Rental {
  id: string;
  start_date: string;
  end_date: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
}

interface EquipmentCalendarProps {
  equipmentId?: string;
  onDateSelect?: (start: Date, end: Date) => void;
}

function CustomToolbar({ label, onNavigate, date }: any) {
  return (
    <div className="flex items-center justify-between mb-2">
      <div className="flex gap-2">
        <button
          className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-100"
          onClick={() => onNavigate('TODAY')}
        >
          Hôm nay
        </button>
        <button
          className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-100"
          onClick={() => onNavigate('PREV')}
        >
          Tháng trước
        </button>
        <button
          className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-100"
          onClick={() => onNavigate('NEXT')}
        >
          Tháng sau
        </button>
      </div>
      <div className="font-semibold text-gray-700">{label}</div>
    </div>
  );
}

export default function EquipmentCalendar({ equipmentId, onDateSelect }: EquipmentCalendarProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!equipmentId) return;

    async function fetchRentals() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('rentals')
          .select('id, start_date, end_date, status')
          .eq('equipment_id', equipmentId)
          .in('status', ['confirmed', 'in_progress']);

        if (error) throw error;

        if (data) {
          const calendarEvents = data.map((rental: Rental) => ({
            id: rental.id,
            title: 'Đã được thuê',
            start: new Date(rental.start_date),
            end: new Date(rental.end_date),
            allDay: true,
          }));
          setEvents(calendarEvents);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchRentals();
  }, [equipmentId]);

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    if (onDateSelect) onDateSelect(start, end);
  };

  // Định dạng tên thứ và ngày như cũ
  const formats = {
    weekdayFormat: (date: Date) => {
      const day = format(date, 'i', { locale: vi });
      if (day === '7') return 'Chủ Nhật';
      return `Thứ ${day}`;
    },
    dayFormat: (date: Date) => format(date, 'd', { locale: vi }),
    dateFormat: (date: Date) => format(date, 'd', { locale: vi }),
    monthHeaderFormat: 'MMMM yyyy',
    dayHeaderFormat: 'eeee, dd/MM/yyyy',
    agendaDateFormat: 'dd/MM/yyyy',
    agendaTimeFormat: 'HH:mm',
  };

  // Xử lý điều hướng tháng trước, tháng sau, hôm nay
  const customNavigate = (action: NavigateAction, date: Date, onNavigate: (date: Date, action: NavigateAction) => void) => {
    switch (action) {
      case 'NEXT':
        onNavigate(addMonths(date, 1), 'month');
        break;
      case 'PREV':
        onNavigate(subMonths(date, 1), 'month');
        break;
      case 'TODAY':
        onNavigate(new Date(), 'month');
        break;
      default:
        onNavigate(date, action);
        break;
    }
  };

  return (
    <div className="max-w-2xl mx-auto rounded-xl p-4 bg-white">
      <div className="flex items-center gap-2 mb-2 text-[#116466]">
        <CalendarIcon className="w-5 h-5" />
        <h3 className="text-lg font-bold">Lịch thuê</h3>
      </div>
      {loading ? (
        <div className="flex justify-center items-center h-32 text-[#116466] text-sm">
          Đang tải...
        </div>
      ) : (
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 340, background: 'transparent' }}
          selectable
          onSelectSlot={handleSelectSlot}
          views={['month']}
          messages={{
            next: 'Tiếp',
            previous: 'Trước',
            today: 'Hôm nay',
            month: 'Tháng',
          }}
          formats={formats}
          components={{
            toolbar: CustomToolbar,
          }}
          onNavigate={(date, action) => customNavigate(action, date, (newDate, newAction) => {
            window.dispatchEvent(new CustomEvent('react-big-calendar:navigate', { detail: { date: newDate, action: newAction } }));
          })}
          eventPropGetter={() => ({
            style: {
              backgroundColor: 'transparent',
              color: '#116466',
              fontWeight: 600,
              fontSize: 14,
              border: 'none',
              boxShadow: 'none',
              padding: 0,
            },
          })}
          popup
        />
      )}
    </div>
  );
}
