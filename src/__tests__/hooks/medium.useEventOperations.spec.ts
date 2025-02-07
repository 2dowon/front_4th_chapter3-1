import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
} from '../../__mocks__/handlersUtils.ts';
import { useEventOperations } from '../../hooks/useEventOperations.ts';
import { server } from '../../setupTests.ts';
import { Event } from '../../types.ts';

// ? Medium: 아래 toastFn과 mock과 이 fn은 무엇을 해줄까요?
const toastFn = vi.fn();

vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react');
  return {
    ...actual,
    useToast: () => toastFn,
  };
});

const mockEvents: Event[] = [
  {
    id: '1',
    title: '기존 회의',
    date: '2024-10-15',
    startTime: '09:00',
    endTime: '10:00',
    description: '기존 팀 미팅',
    location: '회의실 B',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
];

it('저장되어있는 초기 이벤트 데이터를 적절하게 불러온다', async () => {
  const { result } = renderHook(() => useEventOperations(false));

  await waitFor(() => {
    expect(result.current.events).toEqual(mockEvents);
  });

  expect(toastFn).toHaveBeenCalledWith({
    title: '일정 로딩 완료!',
    status: 'info',
    duration: 1000,
  });
});

it('정의된 이벤트 정보를 기준으로 적절하게 저장이 된다', async () => {
  setupMockHandlerCreation(mockEvents);

  const newEvent: Event = {
    id: '2',
    title: '기존 회의2',
    date: '2024-10-15',
    startTime: '11:00',
    endTime: '12:00',
    description: '기존 팀 미팅 2',
    location: '회의실 C',
    category: '업무 회의',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 5,
  };

  const { result } = renderHook(() => useEventOperations(false));

  await act(async () => {
    await result.current.saveEvent(newEvent);
  });

  await waitFor(() => {
    expect(result.current.events).toEqual([...mockEvents, newEvent]);
    expect(toastFn).toHaveBeenCalledWith({
      title: '일정이 추가되었습니다.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  });
});

it("새로 정의된 'title', 'endTime' 기준으로 적절하게 일정이 업데이트 된다", async () => {
  setupMockHandlerCreation(mockEvents);

  const { result } = renderHook(() => useEventOperations(true));

  await waitFor(() => {
    expect(result.current.events).toEqual(mockEvents);
  });

  const updatedEvent = {
    ...mockEvents[0],
    title: '수정된 회의',
    endTime: '11:00',
  };

  setupMockHandlerCreation([updatedEvent]);

  await act(async () => {
    await result.current.saveEvent(updatedEvent);
  });

  await waitFor(() => {
    expect(result.current.events).toEqual([updatedEvent]);
  });

  expect(toastFn).toHaveBeenCalledWith({
    title: '일정이 수정되었습니다.',
    status: 'success',
    duration: 3000,
    isClosable: true,
  });
});

it('존재하는 이벤트 삭제 시 에러없이 아이템이 삭제된다.', async () => {
  setupMockHandlerDeletion();

  const { result } = renderHook(() => useEventOperations(false));

  await waitFor(() => {
    expect(result.current.events).toEqual([
      {
        id: '1',
        title: '삭제할 이벤트',
        date: '2024-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '삭제할 이벤트입니다',
        location: '어딘가',
        category: '기타',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);
  });

  await act(async () => {
    await result.current.deleteEvent(mockEvents[0].id);
  });

  await waitFor(() => {
    expect(result.current.events).toEqual(mockEvents.slice(1));
  });
});

it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다", async () => {
  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ message: '이벤트 로딩 실패' }, { status: 500 });
    })
  );

  const { result } = renderHook(() => useEventOperations(false));

  await waitFor(() => {
    expect(result.current.events).toEqual([]);
  });

  expect(toastFn).toHaveBeenCalledWith({
    title: '이벤트 로딩 실패',
    status: 'error',
    duration: 3000,
    isClosable: true,
  });
});

it("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다", async () => {
  server.use(
    http.put(`/api/events/${mockEvents[0].id}`, () => {
      return HttpResponse.json({ message: '일정 저장 실패' }, { status: 404 });
    })
  );

  const { result } = renderHook(() => useEventOperations(true));

  await act(async () => {
    await result.current.saveEvent(mockEvents[0]);
  });

  expect(toastFn).toHaveBeenCalledWith({
    title: '일정 저장 실패',
    status: 'error',
    duration: 3000,
    isClosable: true,
  });
});

it("네트워크 오류 시 '일정 삭제 실패'라는 텍스트가 노출되며 이벤트 삭제가 실패해야 한다", async () => {
  server.use(
    http.delete('/api/events/:id', () => {
      return HttpResponse.error();
    })
  );

  const { result } = renderHook(() => useEventOperations(false));

  await waitFor(() => {
    expect(result.current.events).toEqual(mockEvents);
  });

  await act(async () => {
    await result.current.deleteEvent(mockEvents[0].id);
  });

  await waitFor(() => {
    expect(result.current.events).toEqual(mockEvents);
  });

  expect(toastFn).toHaveBeenCalledWith({
    title: '일정 삭제 실패',
    status: 'error',
    duration: 3000,
    isClosable: true,
  });
});
