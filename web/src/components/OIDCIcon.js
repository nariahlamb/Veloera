/*
Copyright (c) 2025 Tethys Plex

This file is part of Veloera.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.
*/
import React from 'react';
import { Icon } from '@douyinfe/semi-ui';

const OIDCIcon = (props) => {
  function CustomIcon() {
    return (
      <svg
        t='1723135116886'
        className='icon'
        viewBox='0 0 1024 1024'
        version='1.1'
        xmlns='http://www.w3.org/2000/svg'
        p-id='10969'
        width='1em'
        height='1em'
      >
        <path
          d='M512 960C265 960 64 759 64 512S265 64 512 64s448 201 448 448-201 448-448 448z m0-882.6c-239.7 0-434.6 195-434.6 434.6s195 434.6 434.6 434.6 434.6-195 434.6-434.6S751.7 77.4 512 77.4z'
          p-id='10970'
          fill='#2c2c2c'
          stroke='#2c2c2c'
          stroke-width='60'
        ></path>
        <path
          d='M197.7 512c0-78.3 31.6-98.8 87.2-98.8 56.2 0 87.2 20.5 87.2 98.8s-31 98.8-87.2 98.8c-55.7 0-87.2-20.5-87.2-98.8z m130.4 0c0-46.8-7.8-64.5-43.2-64.5-35.2 0-42.9 17.7-42.9 64.5 0 47.1 7.8 63.7 42.9 63.7 35.4 0 43.2-16.6 43.2-63.7zM409.7 415.9h42.1V608h-42.1V415.9zM653.9 512c0 74.2-37.1 96.1-93.6 96.1h-65.9V415.9h65.9c56.5 0 93.6 16.1 93.6 96.1z m-43.5 0c0-49.3-17.7-60.6-52.3-60.6h-21.6v120.7h21.6c35.4 0 52.3-13.3 52.3-60.1zM686.5 512c0-74.2 36.3-98.8 92.7-98.8 18.3 0 33.2 2.2 44.8 6.4v36.3c-11.9-4.2-26-6.6-42.1-6.6-34.6 0-49.8 15.5-49.8 62.6 0 50.1 15.2 62.6 49.3 62.6 15.8 0 30.2-2.2 44.8-7.5v36c-11.3 4.7-28.5 8-46.8 8-56.1-0.2-92.9-18.7-92.9-99z'
          p-id='10971'
          fill='#2c2c2c'
          stroke='#2c2c2c'
          stroke-width='20'
        ></path>
      </svg>
    );
  }

  return <Icon svg={<CustomIcon />} />;
};

export default OIDCIcon;
