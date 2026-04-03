import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

const okJson = (data) => HttpResponse.json(data, { status: 200 });

export const defaultHandlers = [
  http.get('/api/health', () => okJson({ ok: true })),
  http.get('/api/establishments', () => okJson({ establishments: [] })),
  http.get('/api/reviews', () => okJson({ reviews: [] })),
  http.get('/api/establishments/:slug', ({ params }) =>
    okJson({
      establishment: {
        _id: 'est-1',
        slug: params.slug,
        restaurantName: 'Test Bistro',
        cuisine: ['French'],
        description: 'Test description',
        address: '123 Test St',
        hours: '9-5',
        phone: '000',
        website: 'https://example.com',
        rating: 4.5,
        restaurantImage: 'https://example.com/image.jpg',
      },
      reviews: [],
    }),
  ),
  http.post('/api/auth/login', async () =>
    okJson({ user: { id: 'u1', username: 'tester' } }),
  ),
  http.post('/api/auth/signup', async () =>
    okJson({ user: { id: 'u2', username: 'new-user' } }),
  ),
  http.put('/api/users/:id', async ({ params, request }) => {
    const updates = await request.json();
    return okJson({
      user: { id: params.id, username: 'tester', ...updates },
    });
  }),
  http.post('/api/establishments/:slug/reviews', async () =>
    HttpResponse.json({ review: { _id: 'r-new' } }, { status: 201 }),
  ),
  http.put('/api/reviews/:id', async () =>
    okJson({
      review: { _id: 'r1', title: 'Updated', rating: 5, body: 'Updated' },
    }),
  ),
  http.delete(
    '/api/reviews/:id',
    async () => new HttpResponse(null, { status: 204 }),
  ),
];

export const server = setupServer(...defaultHandlers);

export { http, HttpResponse };
