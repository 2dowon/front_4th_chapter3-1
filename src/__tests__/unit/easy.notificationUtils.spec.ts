import { Event } from '../../types';
import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';

const events: Event[] = [
  {
    id: '1',
    title: 'Event 1',
    date: '2024-07-01',
    startTime: '09:00',
    endTime: '10:00',
    description: '',
    location: '',
    category: 'default',
    repeat: {
      type: 'none' as const,
      interval: 0,
    },
    notificationTime: 10,
  },
  {
    id: '2',
    title: 'Event 2',
    date: '2024-07-02',
    startTime: '14:00',
    endTime: '15:00',
    description: '',
    location: '',
    category: 'default',
    repeat: { type: 'none' as const, interval: 0 },
    notificationTime: 0,
  },
];

describe('getUpcomingEvents', () => {
  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    const now = new Date('2024-05-01 14:30');
    const notifiedEvents: string[] = [];
    const result = getUpcomingEvents(events, now, notifiedEvents);
    expect(result).toEqual([]);
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    const now = new Date('2024-05-01 14:30');
    const notifiedEvents: string[] = ['1'];
    const result = getUpcomingEvents(events, now, notifiedEvents);
    expect(result).toEqual([]);
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    const now = new Date('2024-05-01 14:20');
    const notifiedEvents: string[] = [];
    const result = getUpcomingEvents(events, now, notifiedEvents);
    expect(result).toEqual([]);
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    const now = new Date('2024-05-01 14:40');
    const notifiedEvents: string[] = [];
    const result = getUpcomingEvents(events, now, notifiedEvents);
    expect(result).toEqual([]);
  });
});

describe('createNotificationMessage', () => {
  it('올바른 알림 메시지를 생성해야 한다', () => {
    const result = createNotificationMessage(events[0]);
    expect(result).toBe('10분 후 Event 1 일정이 시작됩니다.');
  });
});
