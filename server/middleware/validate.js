export function validate({ body, params, query } = {}) {
  return (req, res, next) => {
    if (body) {
      const result = body.safeParse(req.body ?? {});
      if (!result.success) {
        return res.status(400).json({ error: result.error.issues[0].message });
      }
      req.body = result.data;
    }

    if (params) {
      const result = params.safeParse(req.params ?? {});
      if (!result.success) {
        return res.status(400).json({ error: result.error.issues[0].message });
      }
      req.params = result.data;
    }

    if (query) {
      const result = query.safeParse(req.query ?? {});
      if (!result.success) {
        return res.status(400).json({ error: result.error.issues[0].message });
      }
      req.query = result.data;
    }

    return next();
  };
}
