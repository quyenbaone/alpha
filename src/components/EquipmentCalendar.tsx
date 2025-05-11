import format from 'date-fns/format';
import getDay from 'date-fns/getDay';
import vi from 'date-fns/locale/vi';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import { useEffect, useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { supabase } from '../lib/supabase';

const locales = {
    'vi': vi,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

interface EquipmentCalendarProps {
    equipmentId: string;
    onDateSelect?: (start: Date, end: Date) => void;
}

export default function EquipmentCalendar({ equipmentId, onDateSelect }: EquipmentCalendarProps) {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRentals();
    }, [equipmentId]);

    const fetchRentals = async () => {
        try {
            const { data: rentals, error } = await supabase
                .from('rentals')
                .select('*')
                .eq('equipment_id', equipmentId)
                .in('status', ['confirmed', 'in_progress']);

            if (error) throw error;

            const calendarEvents = rentals.map(rental => ({
                id: rental.id,
                title: 'Đã được thuê',
                start: new Date(rental.start_date),
                end: new Date(rental.end_date),
                allDay: true,
                resource: rental,
            }));

            setEvents(calendarEvents);
        } catch (error) {
            console.error('Error fetching rentals:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = ({ start, end }) => {
        if (onDateSelect) {
            onDateSelect(start, end);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64">Đang tải...</div>;
    }

    return (
        <div className="h-[600px]">
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%' }}
                onSelectSlot={handleSelect}
                selectable
                views={['month', 'week', 'day']}
                messages={{
                    next: "Tiếp",
                    previous: "Trước",
                    today: "Hôm nay",
                    month: "Tháng",
                    week: "Tuần",
                    day: "Ngày",
                }}
                eventPropGetter={(event) => ({
                    className: 'bg-red-500',
                })}
            />
        </div>
    );
} 