import React from 'react';
import { CogIcon } from '@heroicons/react/24/outline';

const SettingsPage: React.FC = () => {
  return (
    <div className="h-full bg-white dark:bg-gray-900">
      <div className="max-w-4xl mx-auto p-8">
        <div className="flex items-center mb-8">
          <CogIcon className="w-8 h-8 text-gray-500 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Settings
          </h1>
        </div>

        <div className="space-y-8">
          {/* 通用设置 */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              General
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Theme
                </label>
                <select className="input w-48">
                  <option value="auto">Auto</option>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Font Size
                </label>
                <select className="input w-48">
                  <option value="12">12px</option>
                  <option value="14">14px</option>
                  <option value="16">16px</option>
                  <option value="18">18px</option>
                </select>
              </div>
            </div>
          </div>

          {/* AI设置 */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              AI Configuration
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  AI Provider
                </label>
                <select className="input w-48">
                  <option value="openai">OpenAI</option>
                  <option value="claude">Claude</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  API Key
                </label>
                <input
                  type="password"
                  placeholder="Enter your API key"
                  className="input w-full max-w-md"
                />
              </div>
            </div>
          </div>

          {/* 编辑器设置 */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Editor
            </h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="wordWrap"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="wordWrap" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Word wrap
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="lineNumbers"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="lineNumbers" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Show line numbers
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="minimap"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="minimap" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Show minimap
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* 保存按钮 */}
        <div className="mt-8 flex justify-end space-x-4">
          <button className="btn btn-secondary">
            Reset to Defaults
          </button>
          <button className="btn btn-primary">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;