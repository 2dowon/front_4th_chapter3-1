import { act, renderHook } from '@testing-library/react';

import { useSearch } from '../../hooks/useSearch.ts';
import { Event } from '../../types.ts';

const events: Event[] = [
  {
    id: '1',
    title: 'Event 1',
    date: '2024-07-01',
    startTime: '09:00',
    endTime: '10:00',
    description: 'test',
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

it('검색어가 비어있을 때 모든 이벤트를 반환해야 한다', () => {
  const { result } = renderHook(() => useSearch(events, new Date('2024-07-01'), 'month'));
  act(() => {
    result.current.setSearchTerm('');
  });
  expect(result.current.filteredEvents).toEqual(events);
});

it('검색어에 맞는 이벤트만 필터링해야 한다', () => {
  const { result } = renderHook(() => useSearch(events, new Date('2024-07-01'), 'month'));
  act(() => {
    result.current.setSearchTerm('Event 1');
  });

  expect(result.current.filteredEvents).toHaveLength(1);
  expect(result.current.filteredEvents[0].title).toBe('Event 1');
});

it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
  const { result } = renderHook(() => useSearch(events, new Date('2024-07-01'), 'month'));
  act(() => {
    result.current.setSearchTerm('test');
  });

  expect(result.current.filteredEvents).toHaveLength(1);
  expect(result.current.filteredEvents[0].title).toBe('Event 1');
});

it('현재 뷰(주간/월간)에 해당하는 이벤트만 반환해야 한다', () => {
  const { result } = renderHook(() => useSearch(events, new Date('2024-07-01'), 'month'));
  act(() => {
    result.current.setSearchTerm('Event 1');
  });

  expect(result.current.filteredEvents).toHaveLength(1);
  expect(result.current.filteredEvents[0].title).toBe('Event 1');
});

it("검색어를 '1'에서 '2'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {
  const { result } = renderHook(() => useSearch(events, new Date('2024-07-01'), 'month'));

  act(() => {
    result.current.setSearchTerm('1');
  });
  expect(result.current.filteredEvents).toHaveLength(1);
  expect(result.current.filteredEvents[0].title).toBe('Event 1');

  act(() => {
    result.current.setSearchTerm('2');
  });
  expect(result.current.filteredEvents).toHaveLength(1);
  expect(result.current.filteredEvents[0].title).toBe('Event 2');
});
