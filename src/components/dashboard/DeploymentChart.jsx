import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const DeploymentChart = ({ deployments }) => {
  // Generate deployment data for the last 7 days
  const generateChartData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    return days.map(day => ({
      day,
      successful: Math.floor(Math.random() * 10) + 5,
      failed: Math.floor(Math.random() * 3) + 1
    }))
  }

  const statusData = [
    { name: 'Successful', value: deployments.filter(d => d.status === 'success').length, color: '#10b981' },
    { name: 'Failed', value: deployments.filter(d => d.status === 'failed').length, color: '#ef4444' },
    { name: 'Building', value: deployments.filter(d => d.status === 'building').length, color: '#f59e0b' }
  ]

  const chartData = generateChartData()

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-white mb-6">Deployment Analytics</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-medium text-dark-300 mb-4">Weekly Deployments</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="day" tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <Bar dataKey="successful" fill="#10b981" radius={[2, 2, 0, 0]} />
              <Bar dataKey="failed" fill="#ef4444" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-dark-300 mb-4">Status Distribution</h4>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center space-x-4 mt-4">
            {statusData.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-sm text-dark-300">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DeploymentChart