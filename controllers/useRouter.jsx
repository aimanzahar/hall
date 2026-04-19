// controllers/useRouter.jsx — Owns `route` + localStorage persistence.
(function () {
  const { useState, useEffect } = React;

  function useRouter(defaultRoute = 'home') {
    const [route, setRoute] = useState(() =>
      localStorage.getItem('hb.route') || defaultRoute
    );
    useEffect(() => {
      localStorage.setItem('hb.route', route);
    }, [route]);
    return { route, setRoute };
  }

  HB.Controllers.useRouter = useRouter;
})();
