from pylsl import StreamInlet, resolve_byprop
from pythonosc import udp_client
from threading import Thread
from time import sleep
import numpy as np  # Module that simplifies computations on matrices
import matplotlib.pyplot as plt  # Module used for plotting
from pylsl import StreamInlet, resolve_byprop  # Module to receive EEG data
import utils  # Our own utility functions
import math 


class Band:
    Delta = 0
    Theta = 1
    Alpha = 2
    Beta = 3


""" EXPERIMENTAL PARAMETERS """
# Modify these to change aspects of the signal processing

# Length of the EEG data buffer (in seconds)
# This buffer will hold last n seconds of data and be used for calculations
BUFFER_LENGTH = 5

# Length of the epochs used to compute the FFT (in seconds)
EPOCH_LENGTH = 1

# Amount of overlap between two consecutive epochs (in seconds)
OVERLAP_LENGTH = 0.8

# Amount to 'shift' the start of each next consecutive epoch
SHIFT_LENGTH = EPOCH_LENGTH - OVERLAP_LENGTH

# Index of the channel(s) (electrodes) to be used
# 0 = left ear, 1 = left forehead, 2 = right forehead, 3 = right ear 'TP9','AF7','AF8','TP10'
INDEX_CHANNEL = [0,1,2,3]


class LslToOscStreamer:

    def __init__(self, host, port, stream_channels):
        self.client = udp_client.SimpleUDPClient(host, port)
        self.inlet = None
        self.stream_channels = stream_channels
        self.is_streaming = False
        self.filter_state = None  # for use with the notch filter
                # Compute the number of epochs in "buffer_length"
        n_win_test = int(np.floor((BUFFER_LENGTH - EPOCH_LENGTH) /
                                  SHIFT_LENGTH + 1))

        # Initialize the band power buffer (for plotting)
        # bands will be ordered: [delta, theta, alpha, beta]
        self.band_buffer = np.zeros((n_win_test, 4))
        self.fs = 0
        self.eeg_buffer = None

        

    def connect(self, prop='type', value='EEG'):
        streams = resolve_byprop(prop, value, timeout=5)
        self.inlet = StreamInlet(streams[0], max_chunklen=12)
        eeg_time_correction = self.inlet.time_correction()
        info = self.inlet.info()
        self.fs = int(info.nominal_srate())
        self.eeg_buffer = np.zeros((int(self.fs * BUFFER_LENGTH), 1))
        return self.inlet is not None
    
    def get_eeg_data(self):
        # Obtain EEG data from the LSL stream
        eeg_data, timestamp = self.inlet.pull_chunk(
        timeout=1, max_samples=int(SHIFT_LENGTH * self.fs))
        delta = []
        alpha = []
        theta = []
        beta = []
        gamma = []
        for i in INDEX_CHANNEL:
            print(i)
            ch_data = np.array(eeg_data)[:, i]

            # Update EEG buffer with the new data
            self.eeg_buffer, self.filter_state = utils.update_buffer(
                self.eeg_buffer, ch_data, notch=True,
                filter_state=self.filter_state)

            """ 3.2 COMPUTE BAND POWERS """
            # Get newest samples from the buffer
            data_epoch = utils.get_last_data(self.eeg_buffer,
                                             EPOCH_LENGTH * self.fs)

            # Compute band powers
            band_powers = utils.compute_band_powers(data_epoch, self.fs)
            self.band_buffer, _ = utils.update_buffer(self.band_buffer,
                                                 np.asarray([band_powers]))
            # Compute the average band powers for all epochs in buffer
            # This helps to smooth out noise
            smooth_band_powers = np.mean(self.band_buffer, axis=0)
        
            delta.append(math.log(smooth_band_powers[Band.Delta]))
            theta.append(math.log(smooth_band_powers[Band.Theta]))
            alpha.append(math.log(smooth_band_powers[Band.Alpha]))
            beta.append(math.log(smooth_band_powers[Band.Beta]))
            gamma.append(math.log(smooth_band_powers[Band.Beta]))
        return delta, theta, alpha, beta, gamma

    def stream_data(self):
        if self.inlet is None:
            raise Exception("LSL stream is not connected")
        self.is_streaming = True
        streaming_thread = Thread(target=self._stream_handler)
        streaming_thread.setDaemon(True)
        streaming_thread.start()

    def _stream_handler(self):
        while self.is_streaming:
            values = self.get_eeg_data()
            for channel_idx, channel in enumerate(self.stream_channels):
                print(channel, values[channel_idx])
                self.client.send_message(channel, values[channel_idx])

    def close_stream(self):
        self.is_streaming = False
        self.inlet.close_stream()


if __name__ == "__main__":
    host = "127.0.0.1"
    port = 5001
    stream_time_sec = 3600
    muse_channels = [
        "/muse/elements/delta_absolute",
        "/muse/elements/theta_absolute",
        "/muse/elements/alpha_absolute",
        "/muse/elements/beta_absolute",
        "/muse/elements/gamma_absolute",
    ]

    streamer = LslToOscStreamer(host, port, muse_channels)
    streamer.connect()

    print("Start streaming data to {}:{} for {} seconds".format(host, port, stream_time_sec))
    streamer.stream_data()
    sleep(stream_time_sec)
    streamer.close_stream()
    print("Stopped streaming. Exiting program...")
