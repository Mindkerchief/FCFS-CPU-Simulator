from flask import Flask, request, jsonify, send_from_directory

app = Flask(__name__)

to_process = []

@app.route('/')
def serve_index():
    return send_from_directory('.', 'index.html')

@app.route('/add', methods=['POST'])
def add_process():
    data = request.get_json()
    try:
        arrival = int(data.get('arrival_time'))
        burst = int(data.get('burst_time'))
    except (ValueError, TypeError):
        return jsonify({'error': 'Arrival Time and Burst Time must be integers.'}), 400

    pid = len(to_process) + 1
    to_process.append({'pid': pid, 'arrival_time': arrival, 'burst_time': burst})
    return jsonify(to_process)

@app.route('/compute', methods=['GET'])
def compute_fcfs():
    # Sort processes by arrival time
    processes = sorted(to_process, key=lambda x: x['arrival_time'])
    n = len(processes)
    current_time = 0
    total_wt = 0
    total_tat = 0

    for i in range(n):
        arrival = processes[i]['arrival_time']
        burst = processes[i]['burst_time']

        # If the current time is less than the arrival time, wait until the process arrives
        if current_time < arrival:
            current_time = arrival

        # Calculate completion time, turnaround time, and waiting time
        completion_time = current_time + burst
        turnaround_time = completion_time - arrival
        waiting_time = turnaround_time - burst

        processes[i]['completion_time'] = completion_time
        processes[i]['turnaround_time'] = turnaround_time
        processes[i]['waiting_time'] = waiting_time

        current_time = completion_time
        total_wt += waiting_time
        total_tat += turnaround_time

    # Calculate average turnaround time and waiting time
    avg_tat = total_tat / n if n > 0 else 0
    avg_wait = total_wt / n if n > 0 else 0

    # Sort processes by PID for output
    sorted_processes = sorted(processes, key=lambda x: x['pid'])

    return jsonify({'processes': sorted_processes, 'average_tat': avg_tat, 'average_wait': avg_wait})

@app.route('/clear', methods=['POST'])
def clear_processes():
    to_process.clear()
    return jsonify({'status': 'cleared'})

if __name__ == '__main__':
    app.run()
