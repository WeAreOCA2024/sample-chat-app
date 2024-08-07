"use client"
import React from 'react';

const RightClickComponent = () => {
  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault(); // デフォルトの右クリックメニューを無効化
    alert('Right click detected');
  };

  return (
    <div onContextMenu={handleContextMenu} style={{ width: '200px', height: '200px', backgroundColor: 'lightgray' }}>
      右クリックを感知
    </div>
  );
};

export default RightClickComponent;