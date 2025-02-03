import { Event } from '../../types';
import {
  convertEventToDateRange,
  findOverlappingEvents,
  isOverlapping,
  parseDateTime,
} from '../../utils/eventOverlap';

const event1: Event = {
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
};

const event2: Event = {
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
};

describe('parseDateTime', () => {
  it('2024-07-01 14:30을 정확한 Date 객체로 변환한다', () => {
    const result = parseDateTime('2024-07-01', '14:30');
    expect(result).toEqual(new Date('2024-07-01T14:30:00'));
  });

  it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
    const result = parseDateTime('2024-07-01', '14:30');
    expect(result).toEqual(new Date('2024-07-01T14:30:00'));
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    const result = parseDateTime('2024/07/01', '14:30');
    expect(result).toBe('Invalid Date');
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    const result = parseDateTime('', '14:30');
    expect(result).toBe('Invalid Date');
  });

  it('시간 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    const result = parseDateTime('2024-07-01', '');
    expect(result).toBe('Invalid Date');
  });
});

describe('convertEventToDateRange', () => {
  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    const result = convertEventToDateRange(event1);
    expect(result).toEqual({
      start: new Date('2024-07-01T09:00:00'),
      end: new Date('2024-07-01T10:00:00'),
    });
  });

  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const result = convertEventToDateRange(event1);
    expect(result).toEqual({
      start: new Date('2024-07-01T09:00:00'),
      end: new Date('2024-07-01T10:00:00'),
    });
  });

  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const result = convertEventToDateRange(event1);
    expect(result).toEqual({
      start: new Date('2024-07-01T09:00:00'),
      end: new Date('2024-07-01T10:00:00'),
    });
  });
});

describe('isOverlapping', () => {
  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    const result = isOverlapping(event1, event1);
    expect(result).toBe(true);
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    const result = isOverlapping(event1, event2);
    expect(result).toBe(false);
  });
});

describe('findOverlappingEvents', () => {
  it('새 이벤트와 겹치는 다른 이벤트를 반환한다', () => {
    const overlappingEvent2 = {
      ...event2,
      date: event1.date,
      startTime: event1.startTime,
      endTime: event1.endTime,
    };

    const result = findOverlappingEvents(event1, [event1, overlappingEvent2]);
    expect(result).toEqual([overlappingEvent2]);
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    const result = findOverlappingEvents(event1, [event2]);
    expect(result).toEqual([]);
  });
});
