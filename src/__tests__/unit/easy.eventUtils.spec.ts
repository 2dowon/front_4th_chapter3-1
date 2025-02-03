import { Event } from '../../types';
import { getFilteredEvents } from '../../utils/eventUtils';

const events: Event[] = [
  {
    id: '1',
    title: 'event 1',
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
    title: 'event 2',
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

describe('getFilteredEvents', () => {
  it("검색어 'event 2'에 맞는 이벤트만 반환한다", () => {
    const result = getFilteredEvents(events, 'event 2', new Date('2024-07-02'), 'week');
    expect(result).toEqual([
      {
        id: '2',
        title: 'event 2',
        date: '2024-07-02',
        startTime: '14:00',
        endTime: '15:00',
        description: '',
        location: '',
        category: 'default',
        repeat: { type: 'none' as const, interval: 0 },
        notificationTime: 0,
      },
    ]);
  });

  it('주간 뷰에서 2024-07-01 주의 이벤트만 반환한다', () => {
    const result = getFilteredEvents(events, '', new Date('2024-07-01'), 'week');
    expect(result).toEqual(events);
  });

  it('월간 뷰에서 2024년 7월의 모든 이벤트를 반환한다', () => {
    const result = getFilteredEvents(events, '', new Date('2024-07-01'), 'month');
    expect(result).toEqual(events);
  });

  it("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {
    const result = getFilteredEvents(events, 'event', new Date('2024-07-01'), 'week');
    expect(result).toEqual(events);
  });

  it('검색어가 없을 때 모든 이벤트를 반환한다', () => {
    const result = getFilteredEvents(events, '', new Date('2024-07-01'), 'week');
    expect(result).toEqual(events);
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    const result = getFilteredEvents(events, 'EVENT 1', new Date('2024-07-01'), 'week');
    expect(result).toEqual([
      {
        id: '1',
        title: 'event 1',
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
    ]);
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    const result = getFilteredEvents(events, '', new Date('2024-07-01'), 'month');
    expect(result).toEqual(events);
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    const result = getFilteredEvents([], '', new Date('2024-07-01'), 'week');
    expect(result).toEqual([]);
  });
});
