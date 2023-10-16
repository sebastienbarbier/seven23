import { useLocation, useMatches, useRouteLoaderData, matchRoutes } from "react-router-dom";
import routes from '../routes';

function searchTitle(ids, routes) {
  const positions = ids.split('-');
  const route = routes[positions[0]];
  if (route) {
    const currentTitle = {
        title: route.title,
        back: route.back,
      };
    if (positions.length > 1) {
      const foundTitle = searchTitle(positions.slice(1).join('-'), route.children);
      return foundTitle || currentTitle;
    } else {
      return currentTitle;
    }
  }
}

const useRouteTitle = () => {
  const matches = useMatches();
  return searchTitle(matches[matches.length-1].id, routes);
}

export default useRouteTitle;